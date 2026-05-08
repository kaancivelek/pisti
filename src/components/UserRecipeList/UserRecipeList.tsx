"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./UserRecipeList.module.css";

interface RecipeSummary {
  _id: string;
  title: string;
  shortTitle?: string;
  categoryName: string;
  imageUrl?: string;
  cookTime?: number;
  cookTimeUnit?: string;
  prepTime?: number;
  prepTimeUnit?: string;
  servings?: number;
  servingUnit?: string;
  createdAt: string;
}

interface UserRecipeListProps {
  onEdit: (id: string) => void;
  refreshKey: number;
}

export default function UserRecipeList({ onEdit, refreshKey }: UserRecipeListProps) {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes");
      if (!res.ok) throw new Error("Tarifler yüklenemedi.");
      const data = await res.json();
      setRecipes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes, refreshKey]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" tarifini silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi.");
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p>{error}</p>
        <button className="btn btn-outline" onClick={fetchRecipes}>Tekrar Dene</button>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        </div>
        <h3>Henüz tarif eklemediniz</h3>
        <p>İlk tarifinizi ekleyerek başlayın.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {recipes.map((recipe) => (
        <div key={recipe._id} className={styles.card}>
          {recipe.imageUrl && (
            <div className={styles.cardImage}>
              <img src={recipe.imageUrl} alt={recipe.title} />
            </div>
          )}
          <div className={styles.cardContent}>
            <span className={styles.category}>{recipe.categoryName}</span>
            <h3 className={styles.cardTitle}>{recipe.title}</h3>
            <div className={styles.cardMeta}>
              {recipe.prepTime && (
                <span>Hazırlık: {recipe.prepTime} {recipe.prepTimeUnit}</span>
              )}
              {recipe.cookTime && (
                <span>Pişirme: {recipe.cookTime} {recipe.cookTimeUnit}</span>
              )}
              {recipe.servings && (
                <span>{recipe.servings} {recipe.servingUnit}</span>
              )}
            </div>
          </div>
          <div className={styles.cardActions}>
            <button
              className={styles.editBtn}
              onClick={() => onEdit(recipe._id)}
              title="Düzenle"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Düzenle
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDelete(recipe._id, recipe.title)}
              disabled={deletingId === recipe._id}
              title="Sil"
            >
              {deletingId === recipe._id ? (
                <span className={styles.miniSpinner} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              )}
              Sil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
