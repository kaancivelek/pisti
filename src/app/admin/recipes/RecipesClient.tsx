"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Trash2, Edit3, Plus, Database, RefreshCw, AlertCircle } from "lucide-react";
import styles from "./Recipes.module.css";
import RecipeFormModal from "@/components/RecipeFormModal/RecipeFormModal";

interface RecipeSummary {
  _id: string;
  title: string;
  shortTitle?: string;
  categoryName: string;
  imageUrl?: string;
  prepTime?: number;
  prepTimeUnit?: string;
  cookTime?: number;
  cookTimeUnit?: string;
  servings?: number;
  servingUnit?: string;
  createdAt: string;
}

const CATEGORIES = [
  "Zeytinyağlı", "Et Yemekleri", "Tavuk Yemekleri", "Balık & Deniz Ürünleri",
  "Çorbalar", "Salatalar", "Kahvaltılık", "Tatlılar", "Pastalar & Börekler",
  "İçecekler", "Vejetaryen", "Vegan", "Aperatifler", "Makarna & Pirinç",
];

export default function RecipesClient() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRecipeId, setEditRecipeId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // CSV Import States
  const [importStatus, setImportStatus] = useState<"idle" | "importing" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState("");

  const fetchRecipes = useCallback(async (p: number, s: string, cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: "15",
      });
      if (s) params.append("search", s);
      if (cat) params.append("category", cat);

      const res = await fetch(`/api/admin/recipes?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Tarifler yüklenemedi.");
      }
      const data = await res.json();
      setRecipes(data.recipes);
      setTotal(data.total);
      setTotalPages(data.pages);
      setPage(data.page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes(page, appliedSearch, appliedCategory);
  }, [page, appliedSearch, appliedCategory, refreshKey, fetchRecipes]);

  // Reset page when applied filters change
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [appliedSearch, appliedCategory]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" tarifini silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Tarif silinemedi.");
      }

      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  const handleEdit = (id: string) => {
    setEditRecipeId(id);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditRecipeId(null);
    setIsFormOpen(true);
  };

  const handleLocalImport = async () => {
    const message = 
      "CSV dosyasındaki ~8000 tarifi içe aktarmak üzeresiniz.\n\n" +
      "TAMAM: Veritabanındaki tüm eski tarifleri siler ve temiz kurulum yapar.\n" +
      "İPTAL: Eski tarifleri silmeden sadece yenilerini ekler (mükerrer kontrolü ile).";

    const overwrite = confirm(message);

    setImportStatus("importing");
    setImportMessage("CSV dosyası okunuyor ve veritabanına aktarılıyor. Bu işlem yaklaşık 10-30 saniye sürebilir...");
    
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overwrite }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İçe aktarım sırasında bir hata oluştu.");
      }

      setImportStatus("success");
      setImportMessage(`Başarıyla ${data.count} adet tarif içe aktarıldı!`);
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      setImportStatus("error");
      setImportMessage(err instanceof Error ? err.message : "İçe aktarım başarısız oldu.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Tarif Yönetimi</h1>
          <p>Tüm sistemdeki tarifleri görüntüle, yeni ekle, düzenle veya sil.</p>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} style={{ marginRight: "0.5rem" }} />
            Yeni Tarif Ekle
          </button>
          <Link href="/admin" className={`btn btn-outline ${styles.backBtn}`}>
            <ArrowLeft size={16} />
            Paneline Dön
          </Link>
        </div>
      </header>

      {/* CSV Import Banner */}
      <div className={styles.importBanner}>
        <div className={styles.importInfo}>
          <h4>Toplu Tarif Yükleme (CSV Seeding)</h4>
          <p>Sunucuda bulunan 67MB boyutundaki <strong>all_recipes_cleaned.csv</strong> dosyasını MongoDB&apos;ye aktarın.</p>
        </div>
        <div className={styles.importActions}>
          {importStatus === "importing" ? (
            <div className={styles.importStatus}>
              <RefreshCw size={16} className={styles.spinner} style={{ margin: 0 }} />
              <span>İçe aktarılıyor...</span>
            </div>
          ) : (
            <button className="btn btn-outline" onClick={handleLocalImport}>
              <Database size={16} style={{ marginRight: "0.5rem" }} />
              CSV İçe Aktar
            </button>
          )}
        </div>
      </div>

      {importStatus !== "idle" && (
        <div
          className={styles.importBanner}
          style={{
            backgroundColor: importStatus === "success" ? "#f0fdf4" : importStatus === "error" ? "#fef2f2" : "#fafaf9",
            borderColor: importStatus === "success" ? "#bbf7d0" : importStatus === "error" ? "#fca5a5" : "var(--border-color)",
            marginTop: "-1rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            {importStatus === "error" && <AlertCircle size={20} style={{ color: "#ef4444", flexShrink: 0 }} />}
            <div>
              <p style={{ color: importStatus === "success" ? "#16a34a" : importStatus === "error" ? "#b91c1c" : "var(--text-primary)", fontSize: "0.875rem" }}>
                {importMessage}
              </p>
            </div>
          </div>
          {importStatus !== "importing" && (
            <button className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }} onClick={() => setImportStatus("idle")}>
              Kapat
            </button>
          )}
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Tarif adı veya içeriğinde ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.categorySelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Tüm Kategoriler</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setAppliedSearch(search);
              setAppliedCategory(category);
            }}
          >
            Uygula
          </button>
        </div>
        <div className={styles.recipeCount}>
          Toplam Sonuç: <strong>{total}</strong>
        </div>
      </div>

      {/* Recipes Table */}
      {loading && recipes.length === 0 ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Tarifler yükleniyor...</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="btn btn-outline" style={{ marginTop: "1rem" }} onClick={() => fetchRecipes(page, search, category)}>
            Tekrar Dene
          </button>
        </div>
      ) : recipes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Tarif bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tarif</th>
                  <th>Kategori</th>
                  <th>Süreler</th>
                  <th>Porsiyon</th>
                  <th style={{ textAlign: "right" }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe._id}>
                    <td data-label="Tarif">
                      <div className={styles.recipeCell}>
                        {recipe.imageUrl ? (
                          <Image src={recipe.imageUrl} alt={recipe.title} className={styles.recipeThumb} width={48} height={48} />
                        ) : (
                          <div className={styles.recipeThumb} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#888" }}>
                            Görsel Yok
                          </div>
                        )}
                        <div className={styles.recipeInfo}>
                          <span className={styles.recipeTitle}>{recipe.title}</span>
                          {recipe.shortTitle && (
                            <span className={styles.recipeShortTitle}>{recipe.shortTitle}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td data-label="Kategori">
                      <span className={styles.categoryBadge}>{recipe.categoryName}</span>
                    </td>
                    <td data-label="Süreler">
                      <div className={styles.metaText}>
                        {recipe.prepTime && <span>Haz: {recipe.prepTime} {recipe.prepTimeUnit}</span>}
                        {recipe.prepTime && recipe.cookTime && <br />}
                        {recipe.cookTime && <span>Piş: {recipe.cookTime} {recipe.cookTimeUnit}</span>}
                      </div>
                    </td>
                    <td data-label="Porsiyon">
                      <span className={styles.metaText}>
                        {recipe.servings ? `${recipe.servings} ${recipe.servingUnit || "kişilik"}` : "-"}
                      </span>
                    </td>
                    <td data-label="İşlemler">
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleEdit(recipe._id)}
                          title="Tarifi Düzenle"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => handleDelete(recipe._id, recipe.title)}
                          title="Tarifi Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                &larr; Önceki
              </button>
              <span className={styles.pageInfo}>
                Sayfa <strong>{page}</strong> / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sonraki &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {/* Recipe Form Modal */}
      <RecipeFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        editRecipeId={editRecipeId}
      />
    </div>
  );
}
