import { makeApiRequest } from "../oauth/request.js";
import { dateToFatSecretFormat } from "../utils/date.js";
import {
  FoodEntriesResponseSchema,
  FoodEntryCreateResponseSchema,
  FoodEntryEditResponseSchema,
  FoodEntryDeleteResponseSchema,
  FoodEntriesMonthResponseSchema,
  type FoodEntriesResponseParsed,
  type FoodEntryCreateResponseParsed,
  type FoodEntryEditResponseParsed,
  type FoodEntryDeleteResponseParsed,
  type FoodEntriesMonthResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig, CreateFoodEntryParams, EditFoodEntryParams } from "../types.js";

/**
 * Get user's food diary entries for a specific date
 */
export async function getFoodEntries(
  config: FatSecretConfig,
  date?: string
): Promise<FoodEntriesResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "food_entries.get",
      date: dateToFatSecretFormat(date),
    },
    config,
    true,
    FoodEntriesResponseSchema
  );
}

/**
 * Add a food entry to the user's diary
 */
export async function createFoodEntry(
  config: FatSecretConfig,
  params: CreateFoodEntryParams
): Promise<FoodEntryCreateResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (params.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  return makeApiRequest(
    "POST",
    {
      method: "food_entry.create",
      food_id: params.foodId,
      food_entry_name: params.foodName,
      serving_id: params.servingId,
      number_of_units: params.quantity.toString(),
      meal: params.mealType,
      date: dateToFatSecretFormat(params.date),
    },
    config,
    true,
    FoodEntryCreateResponseSchema
  );
}

/**
 * Edit an existing food diary entry
 */
export async function editFoodEntry(
  config: FatSecretConfig,
  params: EditFoodEntryParams
): Promise<FoodEntryEditResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!params.foodEntryId) {
    throw new Error("Food entry ID is required");
  }

  if (params.quantity !== undefined && params.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const requestParams: Record<string, string> = {
    method: "food_entry.edit",
    food_entry_id: params.foodEntryId,
  };

  if (params.foodName !== undefined) {
    requestParams.food_entry_name = params.foodName;
  }
  if (params.servingId !== undefined) {
    requestParams.serving_id = params.servingId;
  }
  if (params.quantity !== undefined) {
    requestParams.number_of_units = params.quantity.toString();
  }
  if (params.mealType !== undefined) {
    requestParams.meal = params.mealType;
  }

  return makeApiRequest(
    "POST",
    requestParams,
    config,
    true,
    FoodEntryEditResponseSchema
  );
}

/**
 * Delete a food diary entry
 */
export async function deleteFoodEntry(
  config: FatSecretConfig,
  foodEntryId: string
): Promise<FoodEntryDeleteResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!foodEntryId) {
    throw new Error("Food entry ID is required");
  }

  return makeApiRequest(
    "POST",
    {
      method: "food_entry.delete",
      food_entry_id: foodEntryId,
    },
    config,
    true,
    FoodEntryDeleteResponseSchema
  );
}

/**
 * Get user's food diary entries summary for a month
 */
export async function getFoodEntriesMonth(
  config: FatSecretConfig,
  date?: string
): Promise<FoodEntriesMonthResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "food_entries.get_month",
      date: dateToFatSecretFormat(date),
    },
    config,
    true,
    FoodEntriesMonthResponseSchema
  );
}
