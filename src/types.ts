import type { RequestInit } from "node-fetch";

// Enums
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'other';
export type WeightType = 'kg' | 'lb';
export type HeightType = 'cm' | 'inch';
export type RecipeSortBy = 'newest' | 'oldest' | 'caloriesPerServingAscending' | 'caloriesPerServingDescending';

// Tool input types (for MCP handlers)
export interface SetCredentialsInput {
  clientId: string;
  clientSecret: string;
}

export interface StartOAuthFlowInput {
  callbackUrl?: string;
}

export interface CompleteOAuthFlowInput {
  requestToken: string;
  requestTokenSecret: string;
  verifier: string;
}

export interface SearchFoodsInput {
  searchExpression: string;
  pageNumber?: number;
  maxResults?: number;
  region?: string;
  language?: string;
}

export interface GetFoodInput {
  foodId: string;
  region?: string;
  language?: string;
}

export interface SearchRecipesInput {
  searchExpression: string;
  recipeTypes?: string;
  recipeTypesMatchAll?: boolean;
  mustHaveImages?: boolean;
  pageNumber?: number;
  maxResults?: number;
  caloriesFrom?: number;
  caloriesTo?: number;
  carbPercentageFrom?: number;
  carbPercentageTo?: number;
  proteinPercentageFrom?: number;
  proteinPercentageTo?: number;
  fatPercentageFrom?: number;
  fatPercentageTo?: number;
  prepTimeFrom?: number;
  prepTimeTo?: number;
  sortBy?: RecipeSortBy;
}

export interface GetRecipeInput {
  recipeId: string;
  language?: string;
}

export interface GetFoodEntriesInput {
  date?: string;
}

export interface AddFoodEntryInput {
  foodId: string;
  foodName: string;
  servingId: string;
  quantity: number;
  mealType: MealType;
  date?: string;
}

export interface EditFoodEntryInput {
  foodEntryId: string;
  foodName?: string;
  servingId?: string;
  quantity?: number;
  mealType?: MealType;
}

export interface DeleteFoodEntryInput {
  foodEntryId: string;
}

export interface GetFoodEntriesMonthInput {
  date?: string;
}

export interface GetWeightMonthInput {
  date?: string;
}

export interface UpdateWeightInput {
  currentWeightKg: number;
  date?: string;
  weightType?: WeightType;
  heightType?: HeightType;
  goalWeightKg?: number;
  currentHeightCm?: number;
  comment?: string;
}

// Saved Meals - Tool input types
export interface GetSavedMealsInput {
  meal?: MealType;
}

export interface CreateSavedMealInput {
  name: string;
  description?: string;
  meals?: string;
}

export interface EditSavedMealInput {
  savedMealId: string;
  name?: string;
  description?: string;
  meals?: string;
}

export interface DeleteSavedMealInput {
  savedMealId: string;
}

export interface GetSavedMealItemsInput {
  savedMealId: string;
}

export interface AddSavedMealItemInput {
  savedMealId: string;
  foodId: string;
  itemName: string;
  servingId: string;
  quantity: number;
}

export interface EditSavedMealItemInput {
  savedMealItemId: string;
  itemName?: string;
  quantity?: number;
}

export interface DeleteSavedMealItemInput {
  savedMealItemId: string;
}

// Favorites - Tool input types
export interface AddFoodFavoriteInput {
  foodId: string;
  servingId?: string;
  quantity?: number;
}

export interface DeleteFoodFavoriteInput {
  foodId: string;
  servingId?: string;
  quantity?: number;
}

export interface GetMostEatenInput {
  meal?: MealType;
}

export interface GetRecentlyEatenInput {
  meal?: MealType;
}

export interface AddRecipeFavoriteInput {
  recipeId: string;
}

export interface DeleteRecipeFavoriteInput {
  recipeId: string;
}

// Config
export interface FatSecretConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  accessTokenSecret?: string;
  userId?: string;
}

// OAuth
export interface OAuthParams {
  oauth_consumer_key: string;
  oauth_nonce: string;
  oauth_signature_method: string;
  oauth_timestamp: string;
  oauth_version: string;
  oauth_token?: string;
  oauth_signature?: string;
}

// Method params
export interface CreateFoodEntryParams {
  foodId: string;
  foodName: string;
  servingId: string;
  quantity: number;
  mealType: MealType;
  date?: string;
}

export interface EditFoodEntryParams {
  foodEntryId: string;
  foodName?: string;
  servingId?: string;
  quantity?: number;
  mealType?: MealType;
}

export interface UpdateWeightParams {
  currentWeightKg: number;
  date?: string;
  weightType?: WeightType;
  heightType?: HeightType;
  goalWeightKg?: number;
  currentHeightCm?: number;
  comment?: string;
}

// Saved Meals - Method params
export interface CreateSavedMealParams {
  name: string;
  description?: string;
  meals?: string;
}

export interface EditSavedMealParams {
  savedMealId: string;
  name?: string;
  description?: string;
  meals?: string;
}

export interface AddSavedMealItemParams {
  savedMealId: string;
  foodId: string;
  itemName: string;
  servingId: string;
  quantity: number;
}

export interface EditSavedMealItemParams {
  savedMealItemId: string;
  itemName?: string;
  quantity?: number;
}

// Favorites - Method params
export interface AddFoodFavoriteParams {
  foodId: string;
  servingId?: string;
  quantity?: number;
}

export interface DeleteFoodFavoriteParams {
  foodId: string;
  servingId?: string;
  quantity?: number;
}

// NOTE: AutocompleteOptions and FindByBarcodeOptions not implemented - require OAuth 2.0

export interface SearchFoodsOptions {
  pageNumber?: number;
  maxResults?: number;
  includeSubCategories?: boolean;
  includeFoodImages?: boolean;
  includeFoodAttributes?: boolean;
  flagDefaultServing?: boolean;
  region?: string;
  language?: string;
}

export interface GetFoodOptions {
  includeSubCategories?: boolean;
  includeFoodImages?: boolean;
  includeFoodAttributes?: boolean;
  flagDefaultServing?: boolean;
  region?: string;
  language?: string;
}

export interface SearchRecipesOptions {
  pageNumber?: number;
  maxResults?: number;
  recipeTypes?: string;
  recipeTypesMatchAll?: boolean;
  mustHaveImages?: boolean;
  caloriesFrom?: number;
  caloriesTo?: number;
  carbPercentageFrom?: number;
  carbPercentageTo?: number;
  proteinPercentageFrom?: number;
  proteinPercentageTo?: number;
  fatPercentageFrom?: number;
  fatPercentageTo?: number;
  prepTimeFrom?: number;
  prepTimeTo?: number;
  sortBy?: RecipeSortBy;
  region?: string;
}

export interface GetRecipeOptions {
  region?: string;
  language?: string;
}

// Request context for OAuth
export interface OAuthContext {
  config: FatSecretConfig;
  baseUrl: string;
}

export type HttpMethod = "GET" | "POST";

export interface FetchOptions extends RequestInit {
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}
