"use server";

import dbConnect from "@/lib/mongodb";
import getRedisClient from "@/lib/redis";
import Recipe from "@/lib/models/Recipe";

export async function getRecipes(page: number, limit: number = 10) {
  const cacheKey = `recipes:${page}:${limit}`;
  const cacheTtlSeconds = 120;

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
  const skip = (page - 1) * limit;
  const recipes = await Recipe.find({})
    .select('-contentText -ingredientGroups -instructionGroups')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(recipes), {
        EX: cacheTtlSeconds,
      });
      console.info("[REDIS] cache set", cacheKey, "ttl", cacheTtlSeconds);
    }
  } catch (error) {
    console.warn("[REDIS] cache write failed", error);
  }

  return structuredClone(recipes);
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

  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(recipe), {
        EX: cacheTtlSeconds,
      });
      console.info("[REDIS] cache set", cacheKey, "ttl", cacheTtlSeconds);
    }
  } catch (error) {
    console.warn("[REDIS] cache write failed", error);
  }

  return structuredClone(recipe);
}
