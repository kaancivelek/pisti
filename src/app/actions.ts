"use server";

import dbConnect from "@/lib/mongodb";
import getRedisClient from "@/lib/redis";
import Recipe from "@/lib/models/Recipe";

export async function getRecipes(
  page: number,
  limit: number = 10,
  search?: string,
  category?: string,
  maxTime?: number
) {
  const hasFilters = Boolean(search || category || maxTime);
  const cacheKey = `recipes:${page}:${limit}:${search || ""}:${category || ""}:${maxTime || ""}`;
  const cacheTtlSeconds = 120;

  if (!hasFilters) {
    try {
      const redis = await getRedisClient();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.info("[REDIS] cache hit", cacheKey);
          return JSON.parse(cached);
        }
        console.info("[REDIS] cache miss", cacheKey);
      }
    } catch (error) {
      console.warn("[REDIS] cache read failed", error);
    }
  }

  await dbConnect();
  const skip = (page - 1) * limit;

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

  if (maxTime) {
    query.$expr = {
      $lte: [
        {
          $add: [
            { $ifNull: ["$prepTime", 0] },
            { $ifNull: ["$cookTime", 0] },
          ],
        },
        maxTime,
      ],
    };
  }

  const recipes = await Recipe.find(query)
    .select("-contentText -ingredientGroups -instructionGroups")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const serialized = recipes.map((r) => ({ ...r, _id: r._id.toString() }));

  if (!hasFilters) {
    try {
      const redis = await getRedisClient();
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(serialized), {
          EX: cacheTtlSeconds,
        });
        console.info("[REDIS] cache set", cacheKey, "ttl", cacheTtlSeconds);
      }
    } catch (error) {
      console.warn("[REDIS] cache write failed", error);
    }
  }

  return structuredClone(serialized);
}

export async function getRecipeById(id: string) {
  const cacheKey = `recipe:${id}`;
  const cacheTtlSeconds = 300;

  try {
    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.info("[REDIS] cache hit", cacheKey);
        return JSON.parse(cached);
      }
      console.info("[REDIS] cache miss", cacheKey);
    }
  } catch (error) {
    console.warn("[REDIS] cache read failed", error);
  }

  await dbConnect();
  const recipe = await Recipe.findById(id).lean();

  if (!recipe) {
    return null;
  }

  const serialized = { ...recipe, _id: recipe._id.toString() };

  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(serialized), {
        EX: cacheTtlSeconds,
      });
      console.info("[REDIS] cache set", cacheKey, "ttl", cacheTtlSeconds);
    }
  } catch (error) {
    console.warn("[REDIS] cache write failed", error);
  }

  return structuredClone(serialized);
}