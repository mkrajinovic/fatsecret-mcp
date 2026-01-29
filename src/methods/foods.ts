import { makeApiRequest } from "../oauth/request.js";
import {
  FoodSearchResponseSchema,
  FoodDetailResponseSchema,
  type FoodSearchResponseParsed,
  type FoodDetailResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig, SearchFoodsOptions, GetFoodOptions } from "../types.js";

/**
 * Search for foods in the FatSecret database
 */
export async function searchFoods(
  config: FatSecretConfig,
  searchExpression: string,
  options: SearchFoodsOptions = {}
): Promise<FoodSearchResponseParsed> {
  // Input validation
  if (!searchExpression || searchExpression.trim() === "") {
    throw new Error("Search expression is required and cannot be empty");
  }

  if (options.pageNumber !== undefined && options.pageNumber < 0) {
    throw new Error("Page number cannot be negative");
  }

  if (options.maxResults !== undefined) {
    if (options.maxResults < 1 || options.maxResults > 50) {
      throw new Error("maxResults must be between 1 and 50");
    }
  }

  const params: Record<string, string> = {
    method: "foods.search",
    search_expression: searchExpression,
    page_number: (options.pageNumber ?? 0).toString(),
    max_results: (options.maxResults ?? 20).toString(),
  };

  if (options.includeSubCategories) {
    params.include_sub_categories = "true";
  }
  if (options.includeFoodImages) {
    params.include_food_images = "true";
  }
  if (options.includeFoodAttributes) {
    params.include_food_attributes = "true";
  }
  if (options.flagDefaultServing) {
    params.flag_default_serving = "true";
  }
  if (options.region) {
    params.region = options.region;
  }
  if (options.language) {
    params.language = options.language;
  }

  return makeApiRequest("GET", params, config, false, FoodSearchResponseSchema);
}

/**
 * Get detailed information about a specific food
 */
export async function getFood(
  config: FatSecretConfig,
  foodId: string,
  options: GetFoodOptions = {}
): Promise<FoodDetailResponseParsed> {
  if (!foodId) {
    throw new Error("Food ID is required");
  }

  const params: Record<string, string> = {
    method: "food.get",
    food_id: foodId,
  };

  if (options.includeSubCategories) {
    params.include_sub_categories = "true";
  }
  if (options.includeFoodImages) {
    params.include_food_images = "true";
  }
  if (options.includeFoodAttributes) {
    params.include_food_attributes = "true";
  }
  if (options.flagDefaultServing) {
    params.flag_default_serving = "true";
  }
  if (options.region) {
    params.region = options.region;
  }
  if (options.language) {
    params.language = options.language;
  }

  return makeApiRequest("GET", params, config, false, FoodDetailResponseSchema);
}

// NOTE: foods.autocomplete and food.find_id_for_barcode methods are not implemented
// because they require OAuth 2.0 authentication which is not yet supported.
// See: https://platform.fatsecret.com/docs/guides/authentication/oauth2
