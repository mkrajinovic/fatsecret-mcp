import { makeApiRequest } from "../oauth/request.js";
import {
  FavoriteFoodsResponseSchema,
  FavoriteRecipesResponseSchema,
  FavoriteSuccessResponseSchema,
  type FavoriteFoodsResponseParsed,
  type FavoriteRecipesResponseParsed,
  type FavoriteSuccessResponseParsed,
} from "../schemas/index.js";
import type {
  FatSecretConfig,
  MealType,
  AddFoodFavoriteParams,
  DeleteFoodFavoriteParams,
} from "../types.js";

/**
 * Add a food to user's favorites
 */
export async function addFoodFavorite(
  config: FatSecretConfig,
  params: AddFoodFavoriteParams
): Promise<FavoriteSuccessResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!params.foodId) {
    throw new Error("Food ID is required");
  }

  if (params.quantity !== undefined && params.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const requestParams: Record<string, string> = {
    method: "food.add_favorite",
    food_id: params.foodId,
  };

  if (params.servingId !== undefined) {
    requestParams.serving_id = params.servingId;
  }
  if (params.quantity !== undefined) {
    requestParams.number_of_units = params.quantity.toString();
  }

  return makeApiRequest(
    "POST",
    requestParams,
    config,
    true,
    FavoriteSuccessResponseSchema
  );
}

/**
 * Remove a food from user's favorites
 */
export async function deleteFoodFavorite(
  config: FatSecretConfig,
  params: DeleteFoodFavoriteParams
): Promise<FavoriteSuccessResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!params.foodId) {
    throw new Error("Food ID is required");
  }

  if (params.quantity !== undefined && params.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const requestParams: Record<string, string> = {
    method: "food.delete_favorite",
    food_id: params.foodId,
  };

  if (params.servingId !== undefined) {
    requestParams.serving_id = params.servingId;
  }
  if (params.quantity !== undefined) {
    requestParams.number_of_units = params.quantity.toString();
  }

  return makeApiRequest(
    "POST",
    requestParams,
    config,
    true,
    FavoriteSuccessResponseSchema
  );
}

/**
 * Get all favorite foods for the authenticated user
 */
export async function getFavoriteFoods(
  config: FatSecretConfig
): Promise<FavoriteFoodsResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "foods.get_favorites",
    },
    config,
    true,
    FavoriteFoodsResponseSchema
  );
}

/**
 * Get most frequently eaten foods for the authenticated user
 */
export async function getMostEatenFoods(
  config: FatSecretConfig,
  meal?: MealType
): Promise<FavoriteFoodsResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  const params: Record<string, string> = {
    method: "foods.get_most_eaten",
  };

  if (meal) {
    params.meal = meal;
  }

  return makeApiRequest("GET", params, config, true, FavoriteFoodsResponseSchema);
}

/**
 * Get recently eaten foods for the authenticated user
 */
export async function getRecentlyEatenFoods(
  config: FatSecretConfig,
  meal?: MealType
): Promise<FavoriteFoodsResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  const params: Record<string, string> = {
    method: "foods.get_recently_eaten",
  };

  if (meal) {
    params.meal = meal;
  }

  return makeApiRequest("GET", params, config, true, FavoriteFoodsResponseSchema);
}

/**
 * Add a recipe to user's favorites
 */
export async function addRecipeFavorite(
  config: FatSecretConfig,
  recipeId: string
): Promise<FavoriteSuccessResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!recipeId) {
    throw new Error("Recipe ID is required");
  }

  return makeApiRequest(
    "POST",
    {
      method: "recipe.add_favorite",
      recipe_id: recipeId,
    },
    config,
    true,
    FavoriteSuccessResponseSchema
  );
}

/**
 * Remove a recipe from user's favorites
 */
export async function deleteRecipeFavorite(
  config: FatSecretConfig,
  recipeId: string
): Promise<FavoriteSuccessResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  if (!recipeId) {
    throw new Error("Recipe ID is required");
  }

  return makeApiRequest(
    "POST",
    {
      method: "recipe.delete_favorite",
      recipe_id: recipeId,
    },
    config,
    true,
    FavoriteSuccessResponseSchema
  );
}

/**
 * Get all favorite recipes for the authenticated user
 */
export async function getFavoriteRecipes(
  config: FatSecretConfig
): Promise<FavoriteRecipesResponseParsed> {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required");
  }

  return makeApiRequest(
    "GET",
    {
      method: "recipes.get_favorites",
    },
    config,
    true,
    FavoriteRecipesResponseSchema
  );
}
