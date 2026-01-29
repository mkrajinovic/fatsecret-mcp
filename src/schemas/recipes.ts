import { z } from "zod";
import { optionalSingleOrArray } from "./utils.js";

const RecipeNutritionSchema = z.object({
  calories: z.string().optional(),
  fat: z.string().optional(),
  carbohydrate: z.string().optional(),
  protein: z.string().optional(),
  saturated_fat: z.string().optional(),
  polyunsaturated_fat: z.string().optional(),
  monounsaturated_fat: z.string().optional(),
  cholesterol: z.string().optional(),
  sodium: z.string().optional(),
  potassium: z.string().optional(),
  fiber: z.string().optional(),
  sugar: z.string().optional(),
});

// Recipe item in search results (v3)
const RecipeItemSchema = z.object({
  recipe_id: z.string(),
  recipe_name: z.string(),
  recipe_description: z.string(),
  recipe_image: z.string().optional(),
  recipe_url: z.string().optional(),
  recipe_nutrition: RecipeNutritionSchema.optional(),
  recipe_ingredients: z.object({
    ingredient: optionalSingleOrArray(z.string()),
  }).optional(),
  recipe_types: z.object({
    recipe_type: optionalSingleOrArray(z.string()),
  }).optional(),
});

const IngredientSchema = z.object({
  food_id: z.string(),
  food_name: z.string(),
  number_of_units: z.string(),
  ingredient_description: z.string().optional(),
  ingredient_url: z.string().optional(),
  measurement_description: z.string().optional(),
  serving_id: z.string().optional(),
});

const DirectionSchema = z.object({
  direction_number: z.string(),
  direction_description: z.string(),
});

export const RecipeSearchResponseSchema = z.object({
  recipes: z.object({
    recipe: optionalSingleOrArray(RecipeItemSchema),
    max_results: z.string(),
    page_number: z.string(),
    total_results: z.string(),
  }),
});

export const RecipeDetailResponseSchema = z.object({
  recipe: z.object({
    recipe_id: z.string(),
    recipe_name: z.string(),
    recipe_description: z.string(),
    recipe_url: z.string().optional(),
    recipe_image: z.string().optional(),
    number_of_servings: z.string().optional(),
    preparation_time_min: z.string().optional(),
    cooking_time_min: z.string().optional(),
    rating: z.string().optional(),
    recipe_types: z.object({
      recipe_type: optionalSingleOrArray(z.string()),
    }).optional(),
    ingredients: z.object({
      ingredient: optionalSingleOrArray(IngredientSchema),
    }).optional(),
    directions: z.object({
      direction: optionalSingleOrArray(DirectionSchema),
    }).optional(),
    serving_sizes: z.object({
      serving: RecipeNutritionSchema,
    }).optional(),
  }),
});

export type RecipeSearchResponseParsed = z.infer<typeof RecipeSearchResponseSchema>;
export type RecipeDetailResponseParsed = z.infer<typeof RecipeDetailResponseSchema>;
export type RecipeItem = z.infer<typeof RecipeItemSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type RecipeNutrition = z.infer<typeof RecipeNutritionSchema>;
