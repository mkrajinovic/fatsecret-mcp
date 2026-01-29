import { z } from "zod";
import { optionalSingleOrArray } from "./utils.js";

const WeightEntrySchema = z.object({
  date_int: z.string(),
  weight_kg: z.string().optional(),
  weight_lbs: z.string().optional(),
  weight_comment: z.string().optional(),
});

export const WeightMonthResponseSchema = z.object({
  month: z.object({
    day: optionalSingleOrArray(WeightEntrySchema),
    from_date_int: z.string().optional(),
    to_date_int: z.string().optional(),
  }),
});

export const WeightUpdateResponseSchema = z.object({
  success: z.object({
    value: z.string(),
  }),
});

export type WeightMonthResponseParsed = z.infer<typeof WeightMonthResponseSchema>;
export type WeightUpdateResponseParsed = z.infer<typeof WeightUpdateResponseSchema>;
export type WeightEntry = z.infer<typeof WeightEntrySchema>;
