import RecipeCatalog from "@/components/RecipeCatalog/RecipeCatalog";
import { mockRecipes } from "@/lib/data/mockRecipes";

// This is a Server Component. Later, we will fetch data from MongoDB here.
export default async function Home() {
  
  // Example of future data fetching:
  // await dbConnect();
  // const recipes = await Recipe.find({}).lean();
  
  const recipes = mockRecipes;

  return (
    <main className="container">
      <RecipeCatalog recipes={recipes} />
    </main>
  );
}
