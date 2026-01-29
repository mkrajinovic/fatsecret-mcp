import { z } from "zod";

export const ProfileResponseSchema = z.object({
  profile: z.object({
    user_id: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    height_measure: z.string().optional(),
    weight_measure: z.string().optional(),
    last_weight_kg: z.string().optional(),
    last_weight_date_int: z.string().optional(),
    goal_weight_kg: z.string().optional(),
  }),
});

export type ProfileResponseParsed = z.infer<typeof ProfileResponseSchema>;
