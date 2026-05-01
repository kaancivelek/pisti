"use client";

import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./Admin.module.css";
import Link from "next/link";

export default function AdminClient() {
  const { data: session } = useSession();

  if (!session?.user || (session.user as any).role !== "admin") return null;

  return (
    <>
      <Navbar />
      <div className={styles.adminWrapper}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Paneli</h1>
            <p className={styles.subtitle}>Tüm sistemi buradan yönet.</p>
          </div>
          <button 
            className={`btn btn-outline ${styles.logoutBtn}`}
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Çıkış Yap
          </button>
        </header>

        <div className={styles.dashboard}>
          <div className={styles.card}>
            <h3>Tüm Tarifler</h3>
            <p>Sistemdeki tüm tarifleri görüntüle, düzenle veya sil.</p>
            <Link href="/admin/recipes" className={`btn btn-primary ${styles.cardBtn}`}>
              Tarifleri Yönet
            </Link>
          </div>
          
          <div className={styles.card}>
            <h3>Kullanıcılar</h3>
            <p>Kayıtlı kullanıcıları gör ve rollerini yönet.</p>
            <Link href="/admin/users" className={`btn btn-primary ${styles.cardBtn}`}>
              Kullanıcıları Yönet
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
