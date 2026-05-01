import RecipeCatalog from "@/components/RecipeCatalog/RecipeCatalog";
import { getRecipes } from "./actions";

// This is a Server Component.
export default async function Home() {
  const initialRecipes = await getRecipes(1, 10);

  return (
    <main className="container">
      <RecipeCatalog initialRecipes={initialRecipes} />
    </main>
  );
}
