import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Recipe from "@/lib/models/Recipe";
import fs from "node:fs";
import path from "node:path";
import csvParser from "csv-parser";

// POST /api/admin/import
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { overwrite } = await req.json();

    await dbConnect();

    if (overwrite) {
      console.log("[CSV IMPORT] Overwrite option selected. Clearing recipes collection.");
      await Recipe.deleteMany({});
    }

    // Load existing slugs to prevent duplicates in memory
    const existingRecipes = await Recipe.find({}).select("slug").lean();
    const usedSlugs = new Set(existingRecipes.map((r: { slug?: string }) => r.slug));

    const csvPath = path.resolve("all_recipes_cleaned.csv");
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { error: "all_recipes_cleaned.csv dosyası sunucuda bulunamadı." },
        { status: 404 }
      );
    }

    const stream = fs.createReadStream(csvPath);
    const parser = stream.pipe(csvParser());

    let batch: Record<string, unknown>[] = [];
    let count = 0;
    const BATCH_SIZE = 1000;

    const importPromise = new Promise<{ count: number }>((resolve, reject) => {
      parser.on("data", async (row) => {
        try {
          if (!row.ContentTitle) return;

          // Generate base slug
          const baseSlug = row.ContentTitle
            .toLowerCase()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

          let slug = baseSlug || "tarif";
          let counter = 1;
          while (usedSlugs.has(slug)) {
            counter++;
            slug = `${baseSlug}-${counter}`;
          }
          usedSlugs.add(slug);

          // Parse ingredient groups
          let ingredientGroups: { name?: string; items: { amount?: string; unit?: string; name: string; note?: string }[] }[] = [];
          if (row.IngredientGroups) {
            try {
              const parsed = JSON.parse(row.IngredientGroups);
              if (Array.isArray(parsed)) {
                ingredientGroups = parsed.map((g: { Name?: string; Items?: { Quantity?: string; Unit?: { Name?: string }; Ingredient?: { Name?: string }; name?: string; Note?: string }[] }) => ({
                  name: g.Name || undefined,
                  items: (g.Items || [])
                    .map((item: { Quantity?: string; Unit?: { Name?: string }; Ingredient?: { Name?: string }; name?: string; Note?: string }) => ({
                      amount: item.Quantity || undefined,
                      unit: item.Unit?.Name || undefined,
                      name: item.Ingredient?.Name || item.name || "",
                      note: item.Note || undefined,
                    }))
                    .filter((item: { name: string }) => item.name),
                }));
              }
            } catch {
              // Ignore JSON parse errors for a single row
            }
          }

          // Parse instruction groups
          let instructionGroups: { name?: string; instructions: { description: string; order: number }[] }[] = [];
          if (row.InstructionGroups) {
            try {
              const parsed = JSON.parse(row.InstructionGroups);
              if (Array.isArray(parsed)) {
                instructionGroups = parsed.map((g: { Name?: string; Instructions?: { Description?: string; description?: string; Order?: number; order?: number }[] }) => ({
                  name: g.Name || undefined,
                  instructions: (g.Instructions || [])
                    .map((ins: { Description?: string; description?: string; Order?: number; order?: number }, index: number) => ({
                      description: ins.Description || ins.description || "",
                      order: ins.Order || ins.order || index + 1,
                    }))
                    .filter((ins: { description: string }) => ins.description),
                }));
              }
            } catch {
              // Ignore JSON parse errors
            }
          }

          // Parse details
          let details: string[] = [];
          if (row.Details) {
            try {
              details = JSON.parse(row.Details);
            } catch {
              // Ignore
            }
          }

          const recipeData = {
            categoryName: row.CategoryName || "Genel",
            title: row.ContentTitle,
            shortTitle: row.ShortTitle || undefined,
            slug,
            permalink: `/tarif/${slug}`,
            contentText: row.ContentText || "",
            description: row.ContentText
              ? row.ContentText.replace(/<[^>]*>/g, "").substring(0, 200) + "..."
              : undefined,
            cookTime: row.CookTime && !isNaN(parseInt(row.CookTime)) ? parseInt(row.CookTime, 10) : undefined,
            cookTimeUnit: row.CookTimeUnit || undefined,
            prepTime: row.PrepTime && !isNaN(parseInt(row.PrepTime)) ? parseInt(row.PrepTime, 10) : undefined,
            prepTimeUnit: row.PrepTimeUnit || undefined,
            imageUrl: row.FeaturedImage || undefined,
            featuredImageAlt: row.FeaturedImageAlt || undefined,
            featuredImageTitle: row.FeaturedImageTitle || undefined,
            ingredientGroups,
            instructionGroups,
            details,
            perServingCalories:
              row.PerServingCalories && !isNaN(parseInt(row.PerServingCalories))
                ? parseInt(row.PerServingCalories, 10)
                : undefined,
            servingUnit: row.ServingUnit || undefined,
            servings: row.Servings && !isNaN(parseInt(row.Servings)) ? parseInt(row.Servings, 10) : undefined,
            rateCount: row.RateCount && !isNaN(parseInt(row.RateCount)) ? parseInt(row.RateCount, 10) : undefined,
            ratePoint: row.RatePoint && !isNaN(parseFloat(row.RatePoint)) ? parseFloat(row.RatePoint) : undefined,
            viewCount: row.ViewCount && !isNaN(parseInt(row.ViewCount)) ? parseInt(row.ViewCount, 10) : undefined,
            authorId: session.user?.id,
            createdAt: row.ContentDate && !isNaN(Date.parse(row.ContentDate)) ? new Date(row.ContentDate) : new Date(),
            updatedAt: row.publishDate && !isNaN(Date.parse(row.publishDate)) ? new Date(row.publishDate) : new Date(),
          };

          batch.push(recipeData);
          count++;

          if (batch.length >= BATCH_SIZE) {
            stream.pause();
            const currentBatch = [...batch];
            batch = [];
            await Recipe.insertMany(currentBatch, { ordered: false });
            stream.resume();
          }
        } catch (err) {
          console.error("Row parsing error in CSV stream:", err);
        }
      });

      parser.on("end", async () => {
        try {
          if (batch.length > 0) {
            await Recipe.insertMany(batch, { ordered: false });
          }
          resolve({ count });
        } catch (err) {
          reject(err);
        }
      });

      parser.on("error", (err) => {
        reject(err);
      });
    });

    const result = await importPromise;

    // Clear Redis Cache
    try {
      const { createClient } = await import("redis");
      const REDIS_URL = process.env.REDIS_URL;
      if (REDIS_URL) {
        const redis = createClient({ url: REDIS_URL });
        await redis.connect();
        await redis.flushAll();
        await redis.disconnect();
        console.log("[REDIS] Cache cleared successfully post-import.");
      }
    } catch (e) {
      console.warn("[REDIS] Cache clearing skipped or failed:", e);
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: unknown) {
    console.error("[API] POST /api/admin/import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
