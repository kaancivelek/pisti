"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Navbar from "@/components/Navbar/Navbar";
import RecipeFormModal from "@/components/RecipeFormModal/RecipeFormModal";
import UserRecipeList from "@/components/UserRecipeList/UserRecipeList";
import ProfileSettingsForm from "@/components/ProfileSettingsForm/ProfileSettingsForm";
import styles from "./Profile.module.css";
import type { User as AuthUser } from "next-auth";

interface ProfileClientProps {
  currentUser: AuthUser;
}

export default function ProfileClient({ currentUser }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"recipes" | "settings">("recipes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecipeId, setEditRecipeId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenCreate = () => {
    setEditRecipeId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditRecipeId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditRecipeId(null);
  };

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <Navbar user={currentUser} />
      <div className={styles.profileWrapper}>
        <header className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {currentUser.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>{currentUser.name}</h1>
            <p className={styles.userEmail}>{currentUser.email}</p>
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
              <div className={styles.sectionHeader}>
                <h2>Tariflerim</h2>
                <button
                  id="add-recipe-btn"
                  className={`btn btn-primary ${styles.addBtn}`}
                  onClick={handleOpenCreate}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Yeni Tarif
                </button>
              </div>
              <UserRecipeList onEdit={handleOpenEdit} refreshKey={refreshKey} />
            </div>
          )}

          {activeTab === "settings" && (
            <div className={styles.settingsSection}>
              <ProfileSettingsForm currentUser={currentUser} />
            </div>
          )}
        </div>
      </div>

      <RecipeFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        editRecipeId={editRecipeId}
      />
    </>
  );
}
