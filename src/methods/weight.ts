import { makeApiRequest } from "../oauth/request.js";
import { dateToFatSecretFormat } from "../utils/date.js";
import { requireAuth, validateWeight, validateHeight } from "../utils/validation.js";
import {
  WeightMonthResponseSchema,
  WeightUpdateResponseSchema,
  type WeightMonthResponseParsed,
  type WeightUpdateResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig, UpdateWeightParams } from "../types.js";

/**
 * Get user's weight entries for a specific month
 */
export async function getWeightMonth(
  config: FatSecretConfig,
  date?: string
): Promise<WeightMonthResponseParsed> {
  requireAuth(config);

  return makeApiRequest(
    "GET",
    {
      method: "weights.get_month",
      date: dateToFatSecretFormat(date),
    },
    config,
    true,
    WeightMonthResponseSchema
  );
}

/**
 * Update or add a weight entry
 */
export async function updateWeight(
  config: FatSecretConfig,
  params: UpdateWeightParams
): Promise<WeightUpdateResponseParsed> {
  requireAuth(config);

  validateWeight(params.currentWeightKg, "Current weight");

  if (params.goalWeightKg !== undefined) {
    validateWeight(params.goalWeightKg, "Goal weight");
  }

  if (params.currentHeightCm !== undefined) {
    validateHeight(params.currentHeightCm, "Height");
  }

  const requestParams: Record<string, string> = {
    method: "weight.update",
    current_weight_kg: params.currentWeightKg.toString(),
  };

  if (params.date !== undefined) {
    requestParams.date = dateToFatSecretFormat(params.date);
  }
  if (params.weightType !== undefined) {
    requestParams.weight_type = params.weightType;
  }
  if (params.heightType !== undefined) {
    requestParams.height_type = params.heightType;
  }
  if (params.goalWeightKg !== undefined) {
    requestParams.goal_weight_kg = params.goalWeightKg.toString();
  }
  if (params.currentHeightCm !== undefined) {
    requestParams.current_height_cm = params.currentHeightCm.toString();
  }
  if (params.comment !== undefined) {
    requestParams.weight_comment = params.comment;
  }

  return makeApiRequest(
    "POST",
    requestParams,
    config,
    true,
    WeightUpdateResponseSchema
  );
}
