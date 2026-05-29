import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RecipesClient from "./RecipesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarif Yönetimi | Pişti",
};

export default async function AdminRecipesPage() {
  const session = await auth();
  
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="container">
      <RecipesClient />
    </main>
  );
}
