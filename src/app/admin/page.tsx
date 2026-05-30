import { Metadata } from "next";
import AdminClient from "./AdminClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Paneli | Pişti",
};

export default async function AdminPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="container">
      <AdminClient user={session.user} />
    </main>
  );
}
