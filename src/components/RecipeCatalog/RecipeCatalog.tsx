"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Navbar from "../Navbar/Navbar";
import RecipeCard from "../RecipeCard/RecipeCard";
import RecipePanel from "../RecipePanel/RecipePanel";
import styles from "./RecipeCatalog.module.css";

import { getRecipeById, getRecipes } from "@/app/actions";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import type { User as AuthUser } from "next-auth";

interface RecipeSummary {
  _id?: string;
  title?: string;
  description?: string;
  shortTitle?: string;
  categoryName?: string;
  category?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
}

interface RecipeCatalogProps {
  readonly initialRecipes: RecipeSummary[];
  readonly currentUser?: AuthUser | null;
}

const CATEGORIES = [
  "Zeytinyağlı", "Et Yemekleri", "Tavuk Yemekleri", "Balık & Deniz Ürünleri",
  "Çorbalar", "Salatalar", "Kahvaltılık", "Tatlılar", "Pastalar & Börekler",
  "İçecekler", "Vejetaryen", "Vegan", "Aperatifler", "Makarna & Pirinç",
];

export default function RecipeCatalog({ initialRecipes, currentUser }: RecipeCatalogProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [detailRequestedId, setDetailRequestedId] = useState<string | null>(null);

  // Search & Filter States (Drafts)
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [maxTime, setMaxTime] = useState<number | undefined>(undefined);

  // Applied States (These trigger the actual fetch)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [appliedMaxTime, setAppliedMaxTime] = useState<number | undefined>(undefined);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const { ref: loadMoreRef, inView } = useInView();

  // We no longer debounce since we use a manual apply button

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["recipes", appliedSearch, appliedCategory, appliedMaxTime],
    queryFn: async ({ pageParam = 1 }) => {
      return await getRecipes(pageParam, 10, appliedSearch, appliedCategory, appliedMaxTime);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    initialData: (!appliedSearch && !appliedCategory && appliedMaxTime === undefined) ? {
      pages: [initialRecipes],
      pageParams: [1]
    } : undefined
  });

  const recipes = data?.pages.flat() || [];

  const selectedId = selectedRecipe?._id as string | undefined;
  const needsDetail = selectedId === detailRequestedId && !selectedRecipe?.ingredientGroups?.length;

  const handleSelectRecipe = (recipe: RecipeSummary) => {
    setSelectedRecipe(recipe);
    setDetailRequestedId(recipe._id || null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setMaxTime(undefined);
    setAppliedSearch("");
    setAppliedCategory("");
    setAppliedMaxTime(undefined);
  };

  const { data: recipeDetail, isFetching: isFetchingDetail } = useQuery({
    queryKey: ["recipe-detail", selectedId],
    queryFn: () => getRecipeById(selectedId as string),
    enabled: Boolean(needsDetail),
    staleTime: 5 * 60 * 1000,
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: merge detail data into selected recipe
  useEffect(() => {
    if (!recipeDetail || !selectedId) {
      return;
    }

    setSelectedRecipe((prev: any) => {
      if (prev?._id !== selectedId) {
        return prev;
      }

      return { ...prev, ...recipeDetail };
    });
  }, [recipeDetail, selectedId]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(headerRef.current, 
      { y: -30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    tl.fromTo(cardsRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      "-=0.4"
    );
  }, []);

  return (
    <>
      <Navbar ref={headerRef} user={currentUser} />

      <header className={styles.header}>
        <h1 className={styles.title}>Minimalist tarif günlüğü.</h1>
        <p>Özenle seçilmiş, sade ve reklamsız. Sadece malzemeler ve adımlar.</p>
      </header>

      {/* Mobile Filter Toggle */}
      <div className={styles.mobileFilterToggle}>
        <button 
          className="btn btn-outline"
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          style={{ width: "100%", justifyContent: "center" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem" }}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {isFilterPanelOpen ? "Filtreleri Kapat" : "Arama ve Filtreler"}
        </button>
      </div>

      <div className={styles.layoutContainer}>
        {/* Sidebar Filters */}
        <aside className={`${styles.sidebar} ${isFilterPanelOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sectionTitle}>Tariflerde Ara</h3>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Örn: Mozaik pasta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sectionTitle}>Kategoriler</h3>
            <ul className={styles.categoryList}>
              <li>
                <button
                  className={`${styles.categoryBtn} ${category === "" ? styles.categoryBtnActive : ""}`}
                  onClick={() => {
                    setCategory("");
                  }}
                >
                  Tüm Tarifler
                </button>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    className={`${styles.categoryBtn} ${category === cat ? styles.categoryBtnActive : ""}`}
                    onClick={() => {
                      setCategory(cat);
                    }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sectionTitle}>Toplam Süre</h3>
            <div className={styles.durationFilters}>
              <button
                className={`${styles.durationBtn} ${maxTime === undefined ? styles.durationBtnActive : ""}`}
                onClick={() => {
                  setMaxTime(undefined);
                }}
              >
                Tümü
              </button>
              <button
                className={`${styles.durationBtn} ${maxTime === 15 ? styles.durationBtnActive : ""}`}
                onClick={() => {
                  setMaxTime(15);
                }}
              >
                Pratik (&lt; 15 dk)
              </button>
              <button
                className={`${styles.durationBtn} ${maxTime === 30 ? styles.durationBtnActive : ""}`}
                onClick={() => {
                  setMaxTime(30);
                }}
              >
                Hızlı (&lt; 30 dk)
              </button>
              <button
                className={`${styles.durationBtn} ${maxTime === 60 ? styles.durationBtnActive : ""}`}
                onClick={() => {
                  setMaxTime(60);
                }}
              >
                Orta (&lt; 1 saat)
              </button>
            </div>
          </div>

          <button 
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: "1rem" }}
            onClick={() => {
              setAppliedSearch(search);
              setAppliedCategory(category);
              setAppliedMaxTime(maxTime);
              setIsFilterPanelOpen(false);
            }}
          >
            Filtreleri Uygula
          </button>

          {(appliedSearch || appliedCategory || appliedMaxTime !== undefined || search || category || maxTime !== undefined) && (
            <button 
              className={`btn btn-outline ${styles.clearBtn}`}
              onClick={handleClearFilters}
            >
              Filtreleri Temizle
            </button>
          )}
        </aside>

        {/* Content Grid */}
        <div className={styles.contentArea}>
          {recipes.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "1rem", opacity: 0.5 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <h3>Aradığınız kriterlere uygun tarif bulunamadı</h3>
              <p>Farklı bir kelime deneyebilir veya filtreleri temizleyebilirsiniz.</p>
              <button className="btn btn-outline" style={{ marginTop: "1rem" }} onClick={handleClearFilters}>
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {recipes.map((recipe, index) => (
                <RecipeCard 
                  key={`${recipe._id}-${index}`} 
                  recipe={recipe} 
                  ref={el => { cardsRef.current[index] = el; }}
                  onClick={() => handleSelectRecipe(recipe)}
                />
              ))}
            </div>
          )}

          <div 
            ref={loadMoreRef} 
            style={{ display: "flex", justifyContent: "center", marginTop: "3rem", paddingBottom: "3rem", minHeight: "50px" }}
          >
            {isFetchingNextPage && (
              <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
                Daha fazla yükleniyor...
              </span>
            )}
            {!hasNextPage && recipes.length > 0 && (
              <span style={{ color: "var(--foreground)", opacity: 0.7 }}>
                Tüm tarifleri gördünüz.
              </span>
            )}
          </div>
        </div>
      </div>

      <RecipePanel 
        recipe={selectedRecipe} 
        isLoading={Boolean(selectedRecipe && needsDetail && isFetchingDetail)}
        onClose={() => {
          setSelectedRecipe(null);
          setDetailRequestedId(null);
        }}
        ref={panelRef} 
      />
    </>
  );
}
