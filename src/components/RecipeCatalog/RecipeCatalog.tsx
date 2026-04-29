"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Navbar from "../Navbar/Navbar";
import RecipeCard from "../RecipeCard/RecipeCard";
import RecipePanel from "../RecipePanel/RecipePanel";
import styles from "./RecipeCatalog.module.css";

interface RecipeCatalogProps {
  recipes: any[];
}

export default function RecipeCatalog({ recipes }: RecipeCatalogProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

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
        <h1 className={styles.title}>The minimalist recipe journal.</h1>
        <p>Curated, simple, and ad-free. Just the ingredients and the steps.</p>
      </header>

      <div className={styles.grid}>
        {recipes.map((recipe, index) => (
          <RecipeCard 
            key={recipe._id} 
            recipe={recipe} 
            ref={el => { cardsRef.current[index] = el; }}
            onClick={() => setSelectedRecipe(recipe)} 
          />
        ))}
      </div>

      <RecipePanel 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)} 
        ref={panelRef} 
      />
    </>
  );
}
