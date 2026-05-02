import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "redis";

// Simple ENV parser since node --env-file might not be available depending on version
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const REDIS_URL = process.env.REDIS_URL;
const LIMIT = Number(process.env.REDIS_PREWARM_LIMIT || 10);
const TOTAL = Number(process.env.REDIS_PREWARM_TOTAL || 100);
const TTL_SECONDS = Number(process.env.REDIS_PREWARM_TTL || 300);

if (!MONGODB_URI) {
  console.error("MONGODB_URI bulunamadi. Lutfen .env.local dosyasini kontrol et.");
  process.exit(1);
}

if (!REDIS_URL) {
  console.error("REDIS_URL bulunamadi. Lutfen .env.local dosyasini kontrol et.");
  process.exit(1);
}

const RecipeSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);

const redis = createClient({ url: REDIS_URL });
redis.on("error", (err) => {
  console.error("[REDIS]", err);
});

try {
  await redis.connect();
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB baglandi");

  const recipes = await Recipe.find({})
    .select("-contentText -ingredientGroups -instructionGroups")
    .sort({ createdAt: -1 })
    .limit(TOTAL)
    .lean();

  const pages = Math.ceil(recipes.length / LIMIT);

  for (let page = 1; page <= pages; page += 1) {
    const start = (page - 1) * LIMIT;
    const chunk = recipes.slice(start, start + LIMIT);
    const cacheKey = `recipes:${page}:${LIMIT}`;
    await redis.set(cacheKey, JSON.stringify(chunk), { EX: TTL_SECONDS });
    console.log("[REDIS] prewarm set", cacheKey, "size", chunk.length);
  }

  console.log("Prewarm tamamlandi");
} catch (error) {
  console.error("Prewarm hata:", error);
  process.exit(1);
} finally {
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  try {
    await redis.disconnect();
  } catch {
    // ignore
  }
}
