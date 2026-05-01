import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profilim | Pişti",
  description: "Profilinizi yönetin ve tariflerinizi görün.",
};

export default function ProfilePage() {
  return (
    <main className="container">
      <ProfileClient />
    </main>
  );
}
