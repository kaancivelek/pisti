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
}

export default function RecipeCatalog({ initialRecipes }: RecipeCatalogProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const { ref: loadMoreRef, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['recipes'],
    queryFn: async ({ pageParam = 1 }) => {
      return await getRecipes(pageParam, 10);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    initialData: {
      pages: [initialRecipes],
      pageParams: [1]
    }
  });

  const recipes = data?.pages.flat() || [];

  const selectedId = selectedRecipe?._id as string | undefined;
  const needsDetail = Boolean(
    !selectedRecipe?.ingredientGroups?.length &&
    !selectedRecipe?.instructionGroups?.length
  );

  const { data: recipeDetail, isFetching: isFetchingDetail } = useQuery({
    queryKey: ["recipe-detail", selectedId],
    queryFn: () => getRecipeById(selectedId as string),
    enabled: Boolean(selectedId && needsDetail),
  });

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
      <Navbar ref={headerRef} />

      <header className={styles.header}>
        <h1 className={styles.title}>Minimalist tarif günlüğü.</h1>
        <p>Özenle seçilmiş, sade ve reklamsız. Sadece malzemeler ve adımlar.</p>
      </header>

      <div className={styles.grid}>
        {recipes.map((recipe, index) => (
          <RecipeCard 
            key={`${recipe._id}-${index}`} 
            recipe={recipe} 
            ref={el => { cardsRef.current[index] = el; }}
            onClick={() => setSelectedRecipe(recipe)} 
          />
        ))}
      </div>

      <div 
        ref={loadMoreRef} 
        style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', paddingBottom: '3rem', minHeight: '50px' }}
      >
        {isFetchingNextPage && (
          <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
            Daha fazla yükleniyor...
          </span>
        )}
        {!hasNextPage && recipes.length > 0 && (
          <span style={{ color: 'var(--foreground)', opacity: 0.7 }}>
            Tüm tarifleri gördünüz.
          </span>
        )}
      </div>

      <RecipePanel 
        recipe={selectedRecipe} 
        isLoading={Boolean(selectedRecipe && needsDetail && isFetchingDetail)}
        onClose={() => setSelectedRecipe(null)} 
        ref={panelRef} 
      />
    </>
  );
}
