import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Recipe from "@/lib/models/Recipe";

// GET /api/admin/recipes?page=1&limit=15&search=...&category=...
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "15", 10));
    const search = searchParams.get("search")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";

    await dbConnect();

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortTitle: { $regex: search, $options: "i" } },
        { contentText: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.categoryName = category;
    }

    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .select("-contentText -ingredientGroups -instructionGroups")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(query),
    ]);

    const serialized = recipes.map((r: any) => ({
      ...r,
      _id: r._id.toString(),
      authorId: r.authorId?.toString(),
    }));

    return NextResponse.json({
      recipes: serialized,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    });
  } catch (error) {
    console.error("[API] GET /api/admin/recipes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
