import { z } from "zod";
import { optionalSingleOrArray } from "./utils.js";

const FoodEntrySchema = z.object({
  food_entry_id: z.string(),
  food_id: z.string(),
  food_entry_name: z.string(),
  serving_id: z.string(),
  number_of_units: z.string(),
  meal: z.string(),
  date_int: z.string(),
  calories: z.string().optional(),
  carbohydrate: z.string().optional(),
  protein: z.string().optional(),
  fat: z.string().optional(),
  saturated_fat: z.string().optional(),
  polyunsaturated_fat: z.string().optional(),
  monounsaturated_fat: z.string().optional(),
  cholesterol: z.string().optional(),
  sodium: z.string().optional(),
  potassium: z.string().optional(),
  fiber: z.string().optional(),
  sugar: z.string().optional(),
});

export const FoodEntriesResponseSchema = z.object({
  food_entries: z.object({
    food_entry: optionalSingleOrArray(FoodEntrySchema),
  }).nullable().optional().transform(val => val ?? { food_entry: [] }),
});

export const FoodEntryCreateResponseSchema = z.object({
  food_entry_id: z.object({
    value: z.string(),
  }),
});

// Success response for edit/delete operations
export const FoodEntryEditResponseSchema = z.object({
  success: z.object({
    value: z.string(),
  }),
});

export const FoodEntryDeleteResponseSchema = z.object({
  success: z.object({
    value: z.string(),
  }),
});

// Day summary for monthly view
const DaySummarySchema = z.object({
  date_int: z.string(),
  calories: z.string().optional(),
  carbohydrate: z.string().optional(),
  protein: z.string().optional(),
  fat: z.string().optional(),
});

export const FoodEntriesMonthResponseSchema = z.object({
  month: z.object({
    from_date_int: z.string(),
    to_date_int: z.string(),
    day: optionalSingleOrArray(DaySummarySchema),
  }).nullable().optional().transform(val => val ?? { from_date_int: "", to_date_int: "", day: [] }),
});

export type FoodEntriesResponseParsed = z.infer<typeof FoodEntriesResponseSchema>;
export type FoodEntryCreateResponseParsed = z.infer<typeof FoodEntryCreateResponseSchema>;
export type FoodEntryEditResponseParsed = z.infer<typeof FoodEntryEditResponseSchema>;
export type FoodEntryDeleteResponseParsed = z.infer<typeof FoodEntryDeleteResponseSchema>;
export type FoodEntriesMonthResponseParsed = z.infer<typeof FoodEntriesMonthResponseSchema>;
export type FoodEntry = z.infer<typeof FoodEntrySchema>;
export type DaySummary = z.infer<typeof DaySummarySchema>;
