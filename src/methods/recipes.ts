import { makeApiRequest } from "../oauth/request.js";
import {
  RecipeSearchResponseSchema,
  RecipeDetailResponseSchema,
  type RecipeSearchResponseParsed,
  type RecipeDetailResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig, SearchRecipesOptions, GetRecipeOptions } from "../types.js";

/**
 * Search for recipes in the FatSecret database
 */
export async function searchRecipes(
  config: FatSecretConfig,
  searchExpression: string,
  options: SearchRecipesOptions = {}
): Promise<RecipeSearchResponseParsed> {
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

  // Validate percentage ranges (0-100)
  const percentageFields = [
    { name: "carbPercentageFrom", value: options.carbPercentageFrom },
    { name: "carbPercentageTo", value: options.carbPercentageTo },
    { name: "proteinPercentageFrom", value: options.proteinPercentageFrom },
    { name: "proteinPercentageTo", value: options.proteinPercentageTo },
    { name: "fatPercentageFrom", value: options.fatPercentageFrom },
    { name: "fatPercentageTo", value: options.fatPercentageTo },
  ];

  for (const field of percentageFields) {
    if (field.value !== undefined && (field.value < 0 || field.value > 100)) {
      throw new Error(`${field.name} must be between 0 and 100`);
    }
  }

  // Validate non-negative fields
  if (options.caloriesFrom !== undefined && options.caloriesFrom < 0) {
    throw new Error("caloriesFrom cannot be negative");
  }
  if (options.caloriesTo !== undefined && options.caloriesTo < 0) {
    throw new Error("caloriesTo cannot be negative");
  }
  if (options.prepTimeFrom !== undefined && options.prepTimeFrom < 0) {
    throw new Error("prepTimeFrom cannot be negative");
  }
  if (options.prepTimeTo !== undefined && options.prepTimeTo < 0) {
    throw new Error("prepTimeTo cannot be negative");
  }

  const params: Record<string, string> = {
    method: "recipes.search",
    search_expression: searchExpression,
    page_number: (options.pageNumber ?? 0).toString(),
    max_results: (options.maxResults ?? 20).toString(),
  };

  if (options.recipeTypes) {
    params.recipe_types = options.recipeTypes;
  }
  if (options.recipeTypesMatchAll !== undefined) {
    params.recipe_types_matchall = options.recipeTypesMatchAll ? "true" : "false";
  }
  if (options.mustHaveImages) {
    params.must_have_images = "true";
  }
  if (options.caloriesFrom !== undefined) {
    params["calories.from"] = options.caloriesFrom.toString();
  }
  if (options.caloriesTo !== undefined) {
    params["calories.to"] = options.caloriesTo.toString();
  }
  if (options.carbPercentageFrom !== undefined) {
    params["carb_percentage.from"] = options.carbPercentageFrom.toString();
  }
  if (options.carbPercentageTo !== undefined) {
    params["carb_percentage.to"] = options.carbPercentageTo.toString();
  }
  if (options.proteinPercentageFrom !== undefined) {
    params["protein_percentage.from"] = options.proteinPercentageFrom.toString();
  }
  if (options.proteinPercentageTo !== undefined) {
    params["protein_percentage.to"] = options.proteinPercentageTo.toString();
  }
  if (options.fatPercentageFrom !== undefined) {
    params["fat_percentage.from"] = options.fatPercentageFrom.toString();
  }
  if (options.fatPercentageTo !== undefined) {
    params["fat_percentage.to"] = options.fatPercentageTo.toString();
  }
  if (options.prepTimeFrom !== undefined) {
    params["prep_time.from"] = options.prepTimeFrom.toString();
  }
  if (options.prepTimeTo !== undefined) {
    params["prep_time.to"] = options.prepTimeTo.toString();
  }
  if (options.sortBy) {
    params.sort_by = options.sortBy;
  }
  if (options.region) {
    params.region = options.region;
  }

  return makeApiRequest("GET", params, config, false, RecipeSearchResponseSchema);
}

/**
 * Get detailed information about a specific recipe
 */
export async function getRecipe(
  config: FatSecretConfig,
  recipeId: string,
  options: GetRecipeOptions = {}
): Promise<RecipeDetailResponseParsed> {
  if (!recipeId) {
    throw new Error("Recipe ID is required");
  }

  const params: Record<string, string> = {
    method: "recipe.get",
    recipe_id: recipeId,
  };

  if (options.region) {
    params.region = options.region;
  }
  if (options.language) {
    params.language = options.language;
  }

  return makeApiRequest("GET", params, config, false, RecipeDetailResponseSchema);
}
