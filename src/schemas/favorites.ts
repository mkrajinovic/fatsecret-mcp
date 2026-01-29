import { z } from "zod";
import { optionalSingleOrArray } from "./utils.js";

// Helper to coerce number to string (API returns IDs as numbers sometimes)
const stringOrNumber = z.union([z.string(), z.number()]).transform(val => String(val));

// Favorite Food entity (for get_favorites, get_most_eaten, get_recently_eaten)
const FavoriteFoodSchema = z.object({
  food_id: stringOrNumber,
  food_name: z.string(),
  food_type: z.string(),
  food_url: z.string(),
  food_description: z.string().optional(),
  serving_id: stringOrNumber,
  number_of_units: stringOrNumber,
});

// Favorite Recipe entity
const FavoriteRecipeSchema = z.object({
  recipe_id: stringOrNumber,
  recipe_name: z.string(),
  recipe_url: z.string(),
  recipe_description: z.string(),
  recipe_image: z.string().optional(),
});

// Response schemas
export const FavoriteFoodsResponseSchema = z.object({
  foods: z.object({
    food: optionalSingleOrArray(FavoriteFoodSchema),
  }).nullable().optional().transform(val => val ?? { food: [] }),
});

export const FavoriteRecipesResponseSchema = z.object({
  recipes: z.object({
    recipe: optionalSingleOrArray(FavoriteRecipeSchema),
  }).nullable().optional().transform(val => val ?? { recipe: [] }),
});

export const FavoriteSuccessResponseSchema = z.object({
  success: z.object({
    value: z.string(),
  }),
});

// Type exports
export type FavoriteFoodsResponseParsed = z.infer<typeof FavoriteFoodsResponseSchema>;
export type FavoriteRecipesResponseParsed = z.infer<typeof FavoriteRecipesResponseSchema>;
export type FavoriteSuccessResponseParsed = z.infer<typeof FavoriteSuccessResponseSchema>;
export type FavoriteFood = z.infer<typeof FavoriteFoodSchema>;
export type FavoriteRecipe = z.infer<typeof FavoriteRecipeSchema>;
