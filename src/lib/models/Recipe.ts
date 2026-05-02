import mongoose, { Document, Schema, Types } from 'mongoose';

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

export interface IRecipe extends Document {
  postId?: string;
  categoryName: string;
  title: string;
  shortTitle?: string;
  slug: string;
  permalink?: string;
  contentDate?: Date;
  publishDate?: Date;
  contentText: string;
  description?: string;
  cookTime?: number;
  cookTimeUnit?: string;
  prepTime?: number;
  prepTimeUnit?: string;
  cookingProposal?: string;
  serviceProposal?: string;
  details?: string[];
  imageUrl?: string;
  featuredImageAlt?: string;
  featuredImageTitle?: string;
  ingredientGroups?: IngredientGroup[];
  instructionGroups?: InstructionGroup[];
  nutritionalValue?: string;
  perServingCalories?: number;
  servingUnit?: string;
  servings?: number;
  rateCount?: number;
  ratePoint?: number;
  viewCount?: number;
  authorId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientItemSchema = new Schema<IngredientItem>(
  {
    amount: { type: String },
    unit: { type: String },
    name: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const IngredientGroupSchema = new Schema<IngredientGroup>(
  {
    name: { type: String },
    items: { type: [IngredientItemSchema], default: [] },
  },
  { _id: false }
);

const InstructionItemSchema = new Schema<InstructionItem>(
  {
    description: { type: String, required: true },
    order: { type: Number },
  },
  { _id: false }
);

const InstructionGroupSchema = new Schema<InstructionGroup>(
  {
    name: { type: String },
    instructions: { type: [InstructionItemSchema], default: [] },
  },
  { _id: false }
);

const RecipeSchema: Schema = new Schema(
  {
    postId: { type: String, index: true },
    categoryName: { type: String, required: true, index: true },
    title: { type: String, required: true },
    shortTitle: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    permalink: { type: String },
    createdAt: { type: Date, index: true },
    contentDate: { type: Date },
    publishDate: { type: Date },
    contentText: { type: String, required: true },
    description: { type: String },
    cookTime: { type: Number },
    cookTimeUnit: { type: String },
    prepTime: { type: Number },
    prepTimeUnit: { type: String },
    cookingProposal: { type: String },
    serviceProposal: { type: String },
    details: [{ type: String }],
    imageUrl: { type: String },
    featuredImageAlt: { type: String },
    featuredImageTitle: { type: String },
    ingredientGroups: { type: [IngredientGroupSchema], default: [] },
    instructionGroups: { type: [InstructionGroupSchema], default: [] },
    nutritionalValue: { type: String },
    perServingCalories: { type: Number },
    servingUnit: { type: String },
    servings: { type: Number },
    rateCount: { type: Number },
    ratePoint: { type: Number },
    viewCount: { type: Number },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);
