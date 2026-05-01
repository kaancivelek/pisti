import { forwardRef } from "react";
import gsap from "gsap";
import { Clock, ArrowRight } from "lucide-react";
import styles from "./RecipeCard.module.css";

interface RecipeCardProps {
  recipe: any;
  onClick: () => void;
}

const RecipeCard = forwardRef<HTMLDivElement, RecipeCardProps>(({ recipe, onClick }, ref) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", duration: 0.3 });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: 0, boxShadow: "0 0px 0px rgba(0,0,0,0)", duration: 0.3 });
  };

  return (
    <div 
      ref={ref}
      className={styles.card}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.imageContainer}>
        <div className={styles.categoryBadge}>{recipe.categoryName || recipe.category}</div>
        <img 
          src={recipe.imageUrl || "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop"} 
          alt={recipe.title} 
          className={styles.image}
          referrerPolicy="no-referrer"
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{recipe.title}</h3>
        <p className={styles.description}>{recipe.description || recipe.shortTitle || ""}</p>
        
        <div className={styles.footer}>
          <div className={styles.time}>
            <span className={styles.timeItem}>
              <Clock size={14} /> {(recipe.prepTime || 0) + (recipe.cookTime || 0)} dk
            </span>
          </div>
          <ArrowRight size={18} color="var(--accent)" />
        </div>
      </div>
    </div>
  );
});

RecipeCard.displayName = "RecipeCard";
export default RecipeCard;
