"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./Profile.module.css";

export default function ProfileClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"recipes" | "settings">("recipes");

  if (!session?.user) return null; // Middleware koruyor zaten ama type safe olması için.

  return (
    <>
      <Navbar />
      <div className={styles.profileWrapper}>
        <header className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>{session.user.name}</h1>
            <p className={styles.userEmail}>{session.user.email}</p>
          </div>
          <button 
            className={`btn btn-outline ${styles.logoutBtn}`}
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Çıkış Yap
          </button>
        </header>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === "recipes" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("recipes")}
          >
            Tariflerim
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "settings" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Profili Düzenle
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "recipes" && (
            <div className={styles.recipesSection}>
              <h2>Tariflerin yakında burada olacak.</h2>
              <p>Şu an için henüz bir tarif eklemedin. Ancak CRUD işlemleri hazır olduğunda burada listelenecek.</p>
              {/* Buraya daha sonra kullanıcının tariflerini listeleyen ve düzenleme/silme sağlayan component gelecek */}
            </div>
          )}

          {activeTab === "settings" && (
            <div className={styles.settingsSection}>
               <h2>Profil Ayarları</h2>
               <p>İsim ve e-posta güncellemeleri de yakında burada aktif olacak.</p>
               {/* Buraya da profil update formu */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
