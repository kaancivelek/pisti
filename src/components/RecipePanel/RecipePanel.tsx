import { forwardRef, useEffect, useRef } from "react";
import gsap from "gsap";
import { X, Utensils } from "lucide-react";
import styles from "./RecipePanel.module.css";

interface RecipePanelProps {
  recipe: any | null;
  onClose: () => void;
}

const RecipePanel = forwardRef<HTMLDivElement, RecipePanelProps>(({ recipe, onClose }, ref) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Forwarded ref is used for the panel itself
  const panelRef = ref as React.MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    if (recipe) {
      document.body.style.overflow = "hidden";
      
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.3,
      });

      gsap.to(panelRef.current, {
        x: "0%",
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      document.body.style.overflow = "auto";
      
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.3,
      });

      gsap.to(panelRef.current, {
        x: "100%",
        duration: 0.4,
        ease: "power3.in",
      });
    }
  }, [recipe, panelRef]);

  return (
    <>
      <div 
        ref={overlayRef}
        className={styles.overlay}
        onClick={onClose}
      />

      <div ref={panelRef} className={styles.panel}>
        {recipe && (
          <div>
            <div className={styles.imageContainer}>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={20} />
              </button>
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className={styles.image}
              />
            </div>
            
            <div className={styles.content}>
              <div className={styles.category}>{recipe.category}</div>
              <h2 className={styles.title}>{recipe.title}</h2>
              <p className={styles.description}>{recipe.description}</p>
              
              <div className={styles.metaGrid}>
                <div>
                  <div className={styles.metaLabel}>Prep time</div>
                  <div className={styles.metaValue}>{recipe.prepTime} mins</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Cook time</div>
                  <div className={styles.metaValue}>{recipe.cookTime} mins</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Servings</div>
                  <div className={styles.metaValue}>
                    <Utensils size={14} /> 2
                  </div>
                </div>
              </div>

              <div>
                <h3 className={styles.sectionTitle}>Ingredients</h3>
                <ul className={styles.ingredientsList}>
                  {recipe.ingredients.map((ing: any, i: number) => (
                    <li key={i} className={styles.ingredientItem}>
                      <span>{ing.name}</span>
                      <span className={styles.ingredientAmount}>{ing.amount} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className={styles.sectionTitle}>Instructions</h3>
                <div className={styles.stepsContainer}>
                  {recipe.steps.map((step: string, i: number) => (
                    <div key={i} className={styles.stepItem}>
                      <div className={styles.stepNumber}>{i + 1}</div>
                      <p className={styles.stepText}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

RecipePanel.displayName = "RecipePanel";
export default RecipePanel;
