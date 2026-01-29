import { makeApiRequest } from "../oauth/request.js";
import {
  SavedMealsResponseSchema,
  SavedMealCreateResponseSchema,
  SavedMealSuccessResponseSchema,
  SavedMealItemsResponseSchema,
  SavedMealItemAddResponseSchema,
  type SavedMealsResponseParsed,
  type SavedMealCreateResponseParsed,
  type SavedMealSuccessResponseParsed,
  type SavedMealItemsResponseParsed,
  type SavedMealItemAddResponseParsed,
} from "../schemas/index.js";
import type {
  FatSecretConfig,
  MealType,
  CreateSavedMealParams,
  EditSavedMealParams,
  AddSavedMealItemParams,
  EditSavedMealItemParams,
} from "../types.js";

/**
 * Get all saved meals for the authenticated user
 */
export async function getSavedMeals(
  config: FatSecretConfig,
  meal?: MealType
): Promise<SavedMealsResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  const params: Record<string, string> = {
    method: "saved_meals.get",
  };

  if (meal) {
    params.meal = meal;
  }

  return makeApiRequest("GET", params, config, true, SavedMealsResponseSchema);
}

/**
 * Create a new saved meal
 */
export async function createSavedMeal(
  config: FatSecretConfig,
  params: CreateSavedMealParams
): Promise<SavedMealCreateResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!params.name || params.name.trim() === "") {
    throw new Error("Saved meal name is required");
  }

  const requestParams: Record<string, string> = {
    method: "saved_meal.create",
    saved_meal_name: params.name,
  };

  if (params.description !== undefined) {
    requestParams.saved_meal_description = params.description;
  }
  if (params.meals !== undefined) {
    requestParams.meals = params.meals;
  }

  return makeApiRequest(
    "POST",
    requestParams,
    config,
    true,
    SavedMealCreateResponseSchema
  );
}

/**
 * Edit an existing saved meal
 */
export async function editSavedMeal(
  config: FatSecretConfig,
  params: EditSavedMealParams
): Promise<SavedMealSuccessResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!params.savedMealId) {
    throw new Error("Saved meal ID is required");
  }

  const requestParams: Record<string, string> = {
    method: "saved_meal.edit",
    saved_meal_id: params.savedMealId,
  };

  if (params.name !== undefined) {
    requestParams.saved_meal_name = params.name;
  }
  if (params.description !== undefined) {
    requestParams.saved_meal_description = params.description;
  }
  if (params.meals !== undefined) {
    requestParams.meals = params.meals;
  }

  return makeApiRequest(
    "POST",
    requestParams,
    config,
    true,
    SavedMealSuccessResponseSchema
  );
}

/**
 * Delete a saved meal
 */
export async function deleteSavedMeal(
  config: FatSecretConfig,
  savedMealId: string
): Promise<SavedMealSuccessResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!savedMealId) {
    throw new Error("Saved meal ID is required");
  }

  return makeApiRequest(
    "POST",
    {
      method: "saved_meal.delete",
      saved_meal_id: savedMealId,
    },
    config,
    true,
    SavedMealSuccessResponseSchema
  );
}

/**
 * Get all items in a saved meal
 */
export async function getSavedMealItems(
  config: FatSecretConfig,
  savedMealId: string
): Promise<SavedMealItemsResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!savedMealId) {
    throw new Error("Saved meal ID is required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "saved_meal_items.get",
      saved_meal_id: savedMealId,
    },
    config,
    true,
    SavedMealItemsResponseSchema
  );
}

/**
 * Add an item to a saved meal
 */
export async function addSavedMealItem(
  config: FatSecretConfig,
  params: AddSavedMealItemParams
): Promise<SavedMealItemAddResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!params.savedMealId) {
    throw new Error("Saved meal ID is required");
  }

  if (!params.foodId) {
    throw new Error("Food ID is required");
  }

  if (!params.itemName || params.itemName.trim() === "") {
    throw new Error("Item name is required");
  }

  if (!params.servingId) {
    throw new Error("Serving ID is required");
  }

  if (params.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  return makeApiRequest(
    "POST",
    {
      method: "saved_meal_item.add",
      saved_meal_id: params.savedMealId,
      food_id: params.foodId,
      saved_meal_item_name: params.itemName,
      serving_id: params.servingId,
      number_of_units: params.quantity.toString(),
    },
    config,
    true,
    SavedMealItemAddResponseSchema
  );
}

/**
 * Edit an item in a saved meal
 */
export async function editSavedMealItem(
  config: FatSecretConfig,
  params: EditSavedMealItemParams
): Promise<SavedMealSuccessResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!params.savedMealItemId) {
    throw new Error("Saved meal item ID is required");
  }

  if (params.quantity !== undefined && params.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const requestParams: Record<string, string> = {
    method: "saved_meal_item.edit",
    saved_meal_item_id: params.savedMealItemId,
  };

  if (params.itemName !== undefined) {
    requestParams.saved_meal_item_name = params.itemName;
  }
  if (params.quantity !== undefined) {
    requestParams.number_of_units = params.quantity.toString();
  }

  return makeApiRequest(
    "POST",
    requestParams,
    config,
    true,
    SavedMealSuccessResponseSchema
  );
}

/**
 * Delete an item from a saved meal
 */
export async function deleteSavedMealItem(
  config: FatSecretConfig,
  savedMealItemId: string
): Promise<SavedMealSuccessResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!savedMealItemId) {
    throw new Error("Saved meal item ID is required");
  }

  return makeApiRequest(
    "POST",
    {
      method: "saved_meal_item.delete",
      saved_meal_item_id: savedMealItemId,
    },
    config,
    true,
    SavedMealSuccessResponseSchema
  );
}
