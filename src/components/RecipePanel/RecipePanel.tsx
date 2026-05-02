import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import { X, Utensils } from "lucide-react";
import styles from "./RecipePanel.module.css";

interface RecipePanelProps {
  recipe: RecipeDetail | null;
  isLoading?: boolean;
  onClose: () => void;
}

interface IngredientItem {
  amount?: string;
  unit?: string;
  name: string;
  note?: string;
}

interface IngredientGroup {
  name?: string;
  items: IngredientItem[];
}

interface InstructionItem {
  description: string;
  order?: number;
}

interface InstructionGroup {
  name?: string;
  instructions: InstructionItem[];
}

interface RecipeDetail {
  _id?: string;
  title?: string;
  description?: string;
  shortTitle?: string;
  categoryName?: string;
  category?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredientGroups?: IngredientGroup[];
  instructionGroups?: InstructionGroup[];
  ingredients?: IngredientItem[];
  steps?: string[];
}

const RecipePanel = forwardRef<HTMLDivElement, RecipePanelProps>(({ recipe, isLoading, onClose }, ref) => {
  const overlayRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => panelRef.current as HTMLDivElement, []);

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
      <button
        ref={overlayRef}
        className={styles.overlay}
        onClick={onClose}
        type="button"
        aria-label="Paneli kapat"
      />

      <div ref={panelRef} className={styles.panel}>
        {recipe && (
          <div>
            <div className={styles.imageContainer}>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={20} />
              </button>
              <img 
                src={recipe.imageUrl || "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop"} 
                alt={recipe.title} 
                className={styles.image}
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className={styles.content}>
              <div className={styles.category}>{recipe.categoryName || recipe.category}</div>
              <h2 className={styles.title}>{recipe.title}</h2>
              <p className={styles.description}>{recipe.description || recipe.shortTitle || ""}</p>
              
              <div className={styles.metaGrid}>
                <div>
                  <div className={styles.metaLabel}>Hazırlık</div>
                  <div className={styles.metaValue}>{recipe.prepTime || 0} dk</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Pişirme</div>
                  <div className={styles.metaValue}>{recipe.cookTime || 0} dk</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Porsiyon</div>
                  <div className={styles.metaValue}>
                    <Utensils size={14} /> {recipe.servings || 2}
                  </div>
                </div>
              </div>

              <div>
                <h3 className={styles.sectionTitle}>Malzemeler</h3>
                {isLoading && (
                  <p style={{ opacity: 0.7, marginBottom: "1rem" }}>Detaylar yukleniyor...</p>
                )}
                {recipe.ingredientGroups && recipe.ingredientGroups.length > 0 ? (
                  recipe.ingredientGroups.map((group) => (
                    <div
                      key={`${group.name ?? "group"}-${group.items?.[0]?.name ?? "item"}`}
                      style={{ marginBottom: '1rem' }}
                    >
                      {group.name && <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{group.name}</h4>}
                      <ul className={styles.ingredientsList}>
                        {group.items.map((ing) => (
                          <li
                            key={`${ing.name}-${ing.amount ?? ""}-${ing.unit ?? ""}-${ing.note ?? ""}`}
                            className={styles.ingredientItem}
                          >
                            <span>{ing.name} {ing.note && <span style={{fontSize: '0.8em', color: '#666'}}>({ing.note})</span>}</span>
                            <span className={styles.ingredientAmount}>{ing.amount} {ing.unit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <ul className={styles.ingredientsList}>
                    {recipe.ingredients?.map((ing) => (
                      <li
                        key={`${ing.name}-${ing.amount ?? ""}-${ing.unit ?? ""}-${ing.note ?? ""}`}
                        className={styles.ingredientItem}
                      >
                        <span>{ing.name}</span>
                        <span className={styles.ingredientAmount}>{ing.amount} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className={styles.sectionTitle}>Hazırlanışı</h3>
                {isLoading && (
                  <p style={{ opacity: 0.7, marginBottom: "1rem" }}>Detaylar yukleniyor...</p>
                )}
                <div className={styles.stepsContainer}>
                  {recipe.instructionGroups && recipe.instructionGroups.length > 0 ? (
                    recipe.instructionGroups.map((group) => (
                      <div key={`${group.name ?? "group"}-${group.instructions?.[0]?.description ?? "step"}`} style={{ marginBottom: '1rem' }}>
                        {group.name && <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{group.name}</h4>}
                        {group.instructions.map((step, stepIndex) => (
                          <div key={`${step.order ?? ""}-${step.description}`} className={styles.stepItem}>
                            <div className={styles.stepNumber}>{step.order || stepIndex + 1}</div>
                            <p className={styles.stepText}>{step.description}</p>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    recipe.steps?.map((step, i) => (
                      <div key={`${step}-${i}`} className={styles.stepItem}>
                        <div className={styles.stepNumber}>{i + 1}</div>
                        <p className={styles.stepText}>{step}</p>
                      </div>
                    ))
                  )}
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
