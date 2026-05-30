import { Metadata } from "next";
import ProfileClient from "./ProfileClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profilim | Pişti",
  description: "Profilinizi yönetin ve tariflerinizi görün.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="container">
      <ProfileClient currentUser={session.user} />
    </main>
  );
}
