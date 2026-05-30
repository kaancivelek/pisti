import RecipeCatalog from "@/components/RecipeCatalog/RecipeCatalog";
import { getRecipes } from "./actions";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// This is a Server Component.
export default async function Home() {
  const initialRecipes = await getRecipes(1, 10);
  const session = await auth();

  return (
    <main className="container">
      <RecipeCatalog initialRecipes={initialRecipes} currentUser={session?.user || null} />
    </main>
  );
}
