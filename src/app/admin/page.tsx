import { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin Paneli | Pişti",
};

export default function AdminPage() {
  return (
    <main className="container">
      <AdminClient />
    </main>
  );
}
