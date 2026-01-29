import { z } from "zod";
import { optionalSingleOrArray } from "./utils.js";

// Helper to coerce number to string (API returns IDs as numbers sometimes)
const stringOrNumber = z.union([z.string(), z.number()]).transform(val => String(val));

// Saved Meal entity
const SavedMealSchema = z.object({
  saved_meal_id: stringOrNumber,
  saved_meal_name: z.string(),
  saved_meal_description: z.string().optional(),
  meals: z.string().optional(),
});

// Saved Meal Item entity
const SavedMealItemSchema = z.object({
  saved_meal_item_id: stringOrNumber,
  food_id: stringOrNumber,
  saved_meal_item_name: z.string(),
  serving_id: stringOrNumber,
  number_of_units: stringOrNumber,
});

// Response schemas
export const SavedMealsResponseSchema = z.object({
  saved_meals: z.object({
    saved_meal: optionalSingleOrArray(SavedMealSchema),
  }).nullable().optional().transform(val => val ?? { saved_meal: [] }),
});

export const SavedMealCreateResponseSchema = z.object({
  saved_meal_id: z.object({
    value: z.string(),
  }),
});

export const SavedMealSuccessResponseSchema = z.object({
  success: z.object({
    value: z.string(),
  }),
});

export const SavedMealItemsResponseSchema = z.object({
  saved_meal_items: z.object({
    saved_meal_item: optionalSingleOrArray(SavedMealItemSchema),
  }).nullable().optional().transform(val => val ?? { saved_meal_item: [] }),
});

export const SavedMealItemAddResponseSchema = z.object({
  saved_meal_item_id: z.object({
    value: z.string(),
  }),
});

// Type exports
export type SavedMealsResponseParsed = z.infer<typeof SavedMealsResponseSchema>;
export type SavedMealCreateResponseParsed = z.infer<typeof SavedMealCreateResponseSchema>;
export type SavedMealSuccessResponseParsed = z.infer<typeof SavedMealSuccessResponseSchema>;
export type SavedMealItemsResponseParsed = z.infer<typeof SavedMealItemsResponseSchema>;
export type SavedMealItemAddResponseParsed = z.infer<typeof SavedMealItemAddResponseSchema>;
export type SavedMeal = z.infer<typeof SavedMealSchema>;
export type SavedMealItem = z.infer<typeof SavedMealItemSchema>;
