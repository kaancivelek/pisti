export interface IngredientItem {
  amount?: string;
  unit?: string;
  name: string;
  note?: string;
}

export interface IngredientGroup {
  name?: string;
  items: IngredientItem[];
}

export interface InstructionItem {
  description: string;
  order?: number;
}

export interface InstructionGroup {
  name?: string;
  instructions: InstructionItem[];
}

export interface RecipePdfData {
  title?: string;
  shortTitle?: string;
  description?: string;
  categoryName?: string;
  prepTime?: number;
  prepTimeUnit?: string;
  cookTime?: number;
  cookTimeUnit?: string;
  servings?: number;
  servingUnit?: string;
  ingredientGroups?: IngredientGroup[];
  instructionGroups?: InstructionGroup[];
}
