import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanıcı Yönetimi | Pişti",
};

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="container">
      <UsersClient />
    </main>
  );
}
