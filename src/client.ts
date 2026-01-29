import type {
  FatSecretConfig,
  MealType,
  CreateFoodEntryParams,
  EditFoodEntryParams,
  UpdateWeightParams,
  CreateSavedMealParams,
  EditSavedMealParams,
  AddSavedMealItemParams,
  EditSavedMealItemParams,
  AddFoodFavoriteParams,
  DeleteFoodFavoriteParams,
  SearchFoodsOptions,
  GetFoodOptions,
  SearchRecipesOptions,
  GetRecipeOptions,
} from "./types.js";
import type {
  FoodSearchResponseParsed,
  FoodDetailResponseParsed,
  RecipeSearchResponseParsed,
  RecipeDetailResponseParsed,
  ProfileResponseParsed,
  FoodEntriesResponseParsed,
  FoodEntryCreateResponseParsed,
  FoodEntryEditResponseParsed,
  FoodEntryDeleteResponseParsed,
  FoodEntriesMonthResponseParsed,
  WeightMonthResponseParsed,
  WeightUpdateResponseParsed,
  SavedMealsResponseParsed,
  SavedMealCreateResponseParsed,
  SavedMealSuccessResponseParsed,
  SavedMealItemsResponseParsed,
  SavedMealItemAddResponseParsed,
  OAuthTokenResponseParsed,
  AccessTokenResponseParsed,
  FavoriteFoodsResponseParsed,
  FavoriteRecipesResponseParsed,
  FavoriteSuccessResponseParsed,
} from "./schemas/index.js";

import * as methods from "./methods/index.js";
import { AUTHORIZE_URL } from "./methods/auth.js";

export class FatSecretClient {
  private config: FatSecretConfig;
  readonly authorizeUrl = AUTHORIZE_URL;

  constructor(config: FatSecretConfig) {
    this.config = config;
  }

  updateConfig(updates: Partial<FatSecretConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): FatSecretConfig {
    return { ...this.config };
  }

  hasCredentials(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  hasAccessToken(): boolean {
    return !!(this.config.accessToken && this.config.accessTokenSecret);
  }

  // Foods
  searchFoods(
    searchExpression: string,
    options?: SearchFoodsOptions
  ): Promise<FoodSearchResponseParsed> {
    return methods.searchFoods(this.config, searchExpression, options);
  }

  getFood(foodId: string, options?: GetFoodOptions): Promise<FoodDetailResponseParsed> {
    return methods.getFood(this.config, foodId, options);
  }

  // Recipes
  searchRecipes(
    searchExpression: string,
    options?: SearchRecipesOptions
  ): Promise<RecipeSearchResponseParsed> {
    return methods.searchRecipes(this.config, searchExpression, options);
  }

  getRecipe(recipeId: string, options?: GetRecipeOptions): Promise<RecipeDetailResponseParsed> {
    return methods.getRecipe(this.config, recipeId, options);
  }

  // Profile
  getProfile(): Promise<ProfileResponseParsed> {
    return methods.getProfile(this.config);
  }

  // Food Diary
  getFoodEntries(date?: string): Promise<FoodEntriesResponseParsed> {
    return methods.getFoodEntries(this.config, date);
  }

  createFoodEntry(params: CreateFoodEntryParams): Promise<FoodEntryCreateResponseParsed> {
    return methods.createFoodEntry(this.config, params);
  }

  editFoodEntry(params: EditFoodEntryParams): Promise<FoodEntryEditResponseParsed> {
    return methods.editFoodEntry(this.config, params);
  }

  deleteFoodEntry(foodEntryId: string): Promise<FoodEntryDeleteResponseParsed> {
    return methods.deleteFoodEntry(this.config, foodEntryId);
  }

  getFoodEntriesMonth(date?: string): Promise<FoodEntriesMonthResponseParsed> {
    return methods.getFoodEntriesMonth(this.config, date);
  }

  // Weight
  getWeightMonth(date?: string): Promise<WeightMonthResponseParsed> {
    return methods.getWeightMonth(this.config, date);
  }

  updateWeight(params: UpdateWeightParams): Promise<WeightUpdateResponseParsed> {
    return methods.updateWeight(this.config, params);
  }

  // Saved Meals
  getSavedMeals(meal?: MealType): Promise<SavedMealsResponseParsed> {
    return methods.getSavedMeals(this.config, meal);
  }

  createSavedMeal(params: CreateSavedMealParams): Promise<SavedMealCreateResponseParsed> {
    return methods.createSavedMeal(this.config, params);
  }

  editSavedMeal(params: EditSavedMealParams): Promise<SavedMealSuccessResponseParsed> {
    return methods.editSavedMeal(this.config, params);
  }

  deleteSavedMeal(savedMealId: string): Promise<SavedMealSuccessResponseParsed> {
    return methods.deleteSavedMeal(this.config, savedMealId);
  }

  getSavedMealItems(savedMealId: string): Promise<SavedMealItemsResponseParsed> {
    return methods.getSavedMealItems(this.config, savedMealId);
  }

  addSavedMealItem(params: AddSavedMealItemParams): Promise<SavedMealItemAddResponseParsed> {
    return methods.addSavedMealItem(this.config, params);
  }

  editSavedMealItem(params: EditSavedMealItemParams): Promise<SavedMealSuccessResponseParsed> {
    return methods.editSavedMealItem(this.config, params);
  }

  deleteSavedMealItem(savedMealItemId: string): Promise<SavedMealSuccessResponseParsed> {
    return methods.deleteSavedMealItem(this.config, savedMealItemId);
  }

  // Favorites - Foods
  addFoodFavorite(params: AddFoodFavoriteParams): Promise<FavoriteSuccessResponseParsed> {
    return methods.addFoodFavorite(this.config, params);
  }

  deleteFoodFavorite(params: DeleteFoodFavoriteParams): Promise<FavoriteSuccessResponseParsed> {
    return methods.deleteFoodFavorite(this.config, params);
  }

  getFavoriteFoods(): Promise<FavoriteFoodsResponseParsed> {
    return methods.getFavoriteFoods(this.config);
  }

  getMostEatenFoods(meal?: MealType): Promise<FavoriteFoodsResponseParsed> {
    return methods.getMostEatenFoods(this.config, meal);
  }

  getRecentlyEatenFoods(meal?: MealType): Promise<FavoriteFoodsResponseParsed> {
    return methods.getRecentlyEatenFoods(this.config, meal);
  }

  // Favorites - Recipes
  addRecipeFavorite(recipeId: string): Promise<FavoriteSuccessResponseParsed> {
    return methods.addRecipeFavorite(this.config, recipeId);
  }

  deleteRecipeFavorite(recipeId: string): Promise<FavoriteSuccessResponseParsed> {
    return methods.deleteRecipeFavorite(this.config, recipeId);
  }

  getFavoriteRecipes(): Promise<FavoriteRecipesResponseParsed> {
    return methods.getFavoriteRecipes(this.config);
  }

  // OAuth
  getRequestToken(callbackUrl?: string): Promise<OAuthTokenResponseParsed> {
    return methods.getRequestToken(this.config, callbackUrl);
  }

  getAccessToken(
    requestToken: string,
    requestTokenSecret: string,
    verifier: string
  ): Promise<AccessTokenResponseParsed> {
    return methods.getAccessToken(this.config, requestToken, requestTokenSecret, verifier);
  }
}

// Re-export types
export type { FatSecretConfig } from "./types.js";
