import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  cuisine?: string;
  imageUrl?: string;
  ingredients: {
    amount: string;
    unit: string;
    name: string;
  }[];
  steps: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    cuisine: { type: String },
    imageUrl: { type: String },
    ingredients: [
      {
        amount: { type: String },
        unit: { type: String },
        name: { type: String, required: true },
      },
    ],
    steps: [{ type: String, required: true }],
    prepTime: { type: Number },
    cookTime: { type: Number },
    servings: { type: Number },
    tags: [{ type: String }],
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);
