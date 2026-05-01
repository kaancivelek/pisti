"use server";

import dbConnect from "@/lib/mongodb";
import Recipe from "@/lib/models/Recipe";

export async function getRecipes(page: number, limit: number = 10) {
  await dbConnect();
  const skip = (page - 1) * limit;
  const recipes = await Recipe.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  return JSON.parse(JSON.stringify(recipes));
}
