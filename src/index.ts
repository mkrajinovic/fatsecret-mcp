#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import * as dotenv from "dotenv";
import { FatSecretClient, FatSecretConfig } from "./client.js";
import type {
  SetCredentialsInput,
  StartOAuthFlowInput,
  CompleteOAuthFlowInput,
  SearchFoodsInput,
  GetFoodInput,
  SearchRecipesInput,
  GetRecipeInput,
  GetFoodEntriesInput,
  AddFoodEntryInput,
  EditFoodEntryInput,
  DeleteFoodEntryInput,
  GetFoodEntriesMonthInput,
  GetWeightMonthInput,
  UpdateWeightInput,
  GetSavedMealsInput,
  CreateSavedMealInput,
  EditSavedMealInput,
  DeleteSavedMealInput,
  GetSavedMealItemsInput,
  AddSavedMealItemInput,
  EditSavedMealItemInput,
  DeleteSavedMealItemInput,
  AddFoodFavoriteInput,
  DeleteFoodFavoriteInput,
  GetMostEatenInput,
  GetRecentlyEatenInput,
  AddRecipeFavoriteInput,
  DeleteRecipeFavoriteInput,
} from "./types.js";

// Suppress dotenv console output
const originalLog = console.log;
console.log = () => {};
dotenv.config();
console.log = originalLog;

class FatSecretMCPServer {
  private server: Server;
  private client: FatSecretClient;
  private configPath: string;

  constructor() {
    this.server = new Server(
      {
        name: "fatsecret-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.configPath = path.join(os.homedir(), ".fatsecret-mcp-config.json");
    // Skip validation - credentials are set dynamically via set_credentials tool
    this.client = new FatSecretClient(
      {
        clientId: process.env.CLIENT_ID || "",
        clientSecret: process.env.CLIENT_SECRET || "",
      },
      { skipCredentialValidation: true }
    );

    this.setupToolHandlers();
  }

  private async loadConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, "utf-8");
      const savedConfig = JSON.parse(configData);
      this.client.updateConfig(savedConfig);
    } catch {
      // Config file doesn't exist, will be created when credentials are set
    }
  }

  private async saveConfig(): Promise<void> {
    await fs.writeFile(
      this.configPath,
      JSON.stringify(this.client.getConfig(), null, 2)
    );
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "set_credentials",
            description: "Set FatSecret API credentials (Client ID and Client Secret)",
            inputSchema: {
              type: "object",
              properties: {
                clientId: { type: "string", description: "Your FatSecret Client ID" },
                clientSecret: { type: "string", description: "Your FatSecret Client Secret" },
              },
              required: ["clientId", "clientSecret"],
            },
          },
          {
            name: "start_oauth_flow",
            description: "Start the 3-legged OAuth flow to get user authorization",
            inputSchema: {
              type: "object",
              properties: {
                callbackUrl: {
                  type: "string",
                  description: 'OAuth callback URL (use "oob" for out-of-band)',
                  default: "oob",
                },
              },
            },
          },
          {
            name: "complete_oauth_flow",
            description: "Complete the OAuth flow with the authorization code/verifier",
            inputSchema: {
              type: "object",
              properties: {
                requestToken: { type: "string", description: "The request token from start_oauth_flow" },
                requestTokenSecret: { type: "string", description: "The request token secret from start_oauth_flow" },
                verifier: { type: "string", description: "The OAuth verifier from the callback or authorization page" },
              },
              required: ["requestToken", "requestTokenSecret", "verifier"],
            },
          },
          {
            name: "search_foods",
            description: "Search for foods in the FatSecret database. Returns up to 50 results per page.",
            inputSchema: {
              type: "object",
              properties: {
                searchExpression: { type: "string", description: 'Search term for foods (e.g., "chicken breast", "apple")' },
                pageNumber: { type: "number", description: "Page number for results (default: 0)", default: 0 },
                maxResults: { type: "number", description: "Maximum results per page (default: 20, max: 50)", default: 20 },
                region: { type: "string", description: "Region filter code (default: 'US')" },
                language: { type: "string", description: "Result language when region is set" },
              },
              required: ["searchExpression"],
            },
          },
          {
            name: "get_food",
            description: "Get detailed nutrition information for a food item. Note: Servings with serving_id=0 cannot be used for diary entries.",
            inputSchema: {
              type: "object",
              properties: {
                foodId: { type: "string", description: "The FatSecret food ID" },
                region: { type: "string", description: "Region filter code (default: 'US')" },
                language: { type: "string", description: "Result language when region is set" },
              },
              required: ["foodId"],
            },
          },
          {
            name: "search_recipes",
            description: "Search for recipes in the FatSecret database. Returns up to 50 results per page.",
            inputSchema: {
              type: "object",
              properties: {
                searchExpression: { type: "string", description: "Search term for recipes" },
                recipeTypes: { type: "string", description: "Filter by recipe types (comma-separated). Values: Appetizer, Breakfast, Dessert, Main Dish, Salad, Side Dish, Soup, Snack" },
                recipeTypesMatchAll: { type: "boolean", description: "If true, recipes must match all types (default: false)" },
                mustHaveImages: { type: "boolean", description: "Only return recipes with images" },
                caloriesFrom: { type: "number", description: "Minimum calories per serving" },
                caloriesTo: { type: "number", description: "Maximum calories per serving" },
                carbPercentageFrom: { type: "number", description: "Minimum carb percentage of calories" },
                carbPercentageTo: { type: "number", description: "Maximum carb percentage of calories" },
                proteinPercentageFrom: { type: "number", description: "Minimum protein percentage of calories" },
                proteinPercentageTo: { type: "number", description: "Maximum protein percentage of calories" },
                fatPercentageFrom: { type: "number", description: "Minimum fat percentage of calories" },
                fatPercentageTo: { type: "number", description: "Maximum fat percentage of calories" },
                prepTimeFrom: { type: "number", description: "Minimum prep time in minutes" },
                prepTimeTo: { type: "number", description: "Maximum prep time in minutes" },
                sortBy: { type: "string", enum: ["newest", "oldest", "caloriesPerServingAscending", "caloriesPerServingDescending"], description: "Sort order for results" },
                pageNumber: { type: "number", description: "Page number for results (default: 0)", default: 0 },
                maxResults: { type: "number", description: "Maximum results per page (default: 20, max: 50)", default: 20 },
              },
              required: ["searchExpression"],
            },
          },
          {
            name: "get_recipe",
            description: "Get detailed information about a specific recipe including ingredients and instructions.",
            inputSchema: {
              type: "object",
              properties: {
                recipeId: { type: "string", description: "The FatSecret recipe ID" },
                language: { type: "string", description: "Result language" },
              },
              required: ["recipeId"],
            },
          },
          {
            name: "get_user_profile",
            description: "Get the authenticated user's profile information. Requires OAuth authentication.",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "get_user_food_entries",
            description: "Get user's food diary entries for a specific date. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format (default: today)" },
              },
            },
          },
          {
            name: "add_food_entry",
            description: "Add a food entry to the user's food diary. Requires OAuth authentication. Quantity must be greater than 0.",
            inputSchema: {
              type: "object",
              properties: {
                foodId: { type: "string", description: "The FatSecret food ID" },
                foodName: { type: "string", description: "Name/description of the food item" },
                servingId: { type: "string", description: "The serving ID for the food" },
                quantity: { type: "number", description: "Quantity of the serving (must be > 0)" },
                mealType: { type: "string", description: "Meal type (breakfast, lunch, dinner, other)", enum: ["breakfast", "lunch", "dinner", "other"] },
                date: { type: "string", description: "Date in YYYY-MM-DD format (default: today)" },
              },
              required: ["foodId", "foodName", "servingId", "quantity", "mealType"],
            },
          },
          {
            name: "edit_food_entry",
            description: "Edit a food entry in the user's diary (can change meal type, quantity, etc.)",
            inputSchema: {
              type: "object",
              properties: {
                foodEntryId: {
                  type: "string",
                  description: "The food entry ID to edit",
                },
                foodEntryName: {
                  type: "string",
                  description: "New name/description of the food entry (optional)",
                },
                servingId: {
                  type: "string",
                  description: "New serving ID (optional)",
                },
                quantity: {
                  type: "number",
                  description: "New quantity (optional)",
                },
                mealType: {
                  type: "string",
                  description: "New meal type: breakfast, lunch, dinner, or other (optional)",
                  enum: ["breakfast", "lunch", "dinner", "other"],
                },
              },
              required: ["foodEntryId"],
            },
          },
          {
            name: "delete_food_entry",
            description: "Delete a food entry from the user's diary",
            inputSchema: {
              type: "object",
              properties: {
                foodEntryId: {
                  type: "string",
                  description: "The food entry ID to delete",
                },
              },
              required: ["foodEntryId"],
            },
          },
          {
            name: "check_auth_status",
            description: "Check if the user is authenticated with FatSecret",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "get_weight_month",
            description: "Get user's weight entries for a specific month. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format to specify the month (default: current month)" },
              },
            },
          },
          {
            name: "edit_food_entry",
            description: "Edit an existing food diary entry. Requires OAuth authentication. Note: Entry date cannot be changed.",
            inputSchema: {
              type: "object",
              properties: {
                foodEntryId: { type: "string", description: "The food entry ID to edit" },
                foodName: { type: "string", description: "New name/description for the food entry" },
                servingId: { type: "string", description: "New serving ID" },
                quantity: { type: "number", description: "New quantity (must be > 0)" },
                mealType: { type: "string", description: "New meal type (breakfast, lunch, dinner, other)", enum: ["breakfast", "lunch", "dinner", "other"] },
              },
              required: ["foodEntryId"],
            },
          },
          {
            name: "delete_food_entry",
            description: "Delete a food diary entry. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                foodEntryId: { type: "string", description: "The food entry ID to delete" },
              },
              required: ["foodEntryId"],
            },
          },
          {
            name: "get_food_entries_month",
            description: "Get summary of user's food diary entries for a month. Returns daily totals of calories and macros. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: "string", description: "Date in YYYY-MM-DD format to specify the month (default: current month)" },
              },
            },
          },
          {
            name: "update_weight",
            description: "Add or update a weight entry for today. Requires OAuth authentication. Weight must be > 0. For first weigh-in, height may be required.",
            inputSchema: {
              type: "object",
              properties: {
                currentWeightKg: { type: "number", description: "Current weight in kilograms (must be > 0)" },
                date: { type: "string", description: "Date in YYYY-MM-DD format (default: today). Note: Only today's date is supported." },
                weightType: { type: "string", enum: ["kg", "lb"], description: "Weight measurement unit (default: 'kg')" },
                heightType: { type: "string", enum: ["cm", "inch"], description: "Height measurement unit (default: 'cm')" },
                goalWeightKg: { type: "number", description: "Goal weight in kilograms" },
                currentHeightCm: { type: "number", description: "Current height in cm (required for first weigh-in)" },
                comment: { type: "string", description: "Optional comment for the weight entry" },
              },
              required: ["currentWeightKg"],
            },
          },
          {
            name: "get_saved_meals",
            description: "Get all saved meals for the authenticated user. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                meal: { type: "string", enum: ["breakfast", "lunch", "dinner", "other"], description: "Filter by meal type" },
              },
            },
          },
          {
            name: "create_saved_meal",
            description: "Create a new saved meal. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Name of the saved meal" },
                description: { type: "string", description: "Description of the saved meal" },
                meals: { type: "string", description: "Comma-separated list of meal types (breakfast, lunch, dinner, other)" },
              },
              required: ["name"],
            },
          },
          {
            name: "edit_saved_meal",
            description: "Edit an existing saved meal. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                savedMealId: { type: "string", description: "The saved meal ID to edit" },
                name: { type: "string", description: "New name for the saved meal" },
                description: { type: "string", description: "New description for the saved meal" },
                meals: { type: "string", description: "New comma-separated list of meal types" },
              },
              required: ["savedMealId"],
            },
          },
          {
            name: "delete_saved_meal",
            description: "Delete a saved meal. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                savedMealId: { type: "string", description: "The saved meal ID to delete" },
              },
              required: ["savedMealId"],
            },
          },
          {
            name: "get_saved_meal_items",
            description: "Get all items in a saved meal. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                savedMealId: { type: "string", description: "The saved meal ID" },
              },
              required: ["savedMealId"],
            },
          },
          {
            name: "add_saved_meal_item",
            description: "Add a food item to a saved meal. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                savedMealId: { type: "string", description: "The saved meal ID" },
                foodId: { type: "string", description: "The food ID to add" },
                itemName: { type: "string", description: "Name for the item" },
                servingId: { type: "string", description: "The serving ID" },
                quantity: { type: "number", description: "Quantity of servings (must be > 0)" },
              },
              required: ["savedMealId", "foodId", "itemName", "servingId", "quantity"],
            },
          },
          {
            name: "edit_saved_meal_item",
            description: "Edit an item in a saved meal. Requires OAuth authentication. Note: serving_id cannot be changed.",
            inputSchema: {
              type: "object",
              properties: {
                savedMealItemId: { type: "string", description: "The saved meal item ID to edit" },
                itemName: { type: "string", description: "New name for the item" },
                quantity: { type: "number", description: "New quantity (must be > 0)" },
              },
              required: ["savedMealItemId"],
            },
          },
          {
            name: "delete_saved_meal_item",
            description: "Delete an item from a saved meal. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                savedMealItemId: { type: "string", description: "The saved meal item ID to delete" },
              },
              required: ["savedMealItemId"],
            },
          },
          {
            name: "add_food_favorite",
            description: "Add a food to user's favorites. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                foodId: { type: "string", description: "The food ID to add to favorites" },
                servingId: { type: "string", description: "Optional serving ID" },
                quantity: { type: "number", description: "Optional quantity (must be > 0)" },
              },
              required: ["foodId"],
            },
          },
          {
            name: "delete_food_favorite",
            description: "Remove a food from user's favorites. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                foodId: { type: "string", description: "The food ID to remove from favorites" },
                servingId: { type: "string", description: "Optional serving ID" },
                quantity: { type: "number", description: "Optional quantity (must be > 0)" },
              },
              required: ["foodId"],
            },
          },
          {
            name: "get_favorite_foods",
            description: "Get all favorite foods for the authenticated user. Requires OAuth authentication.",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "get_most_eaten_foods",
            description: "Get most frequently eaten foods for the authenticated user. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                meal: { type: "string", enum: ["breakfast", "lunch", "dinner", "other"], description: "Filter by meal type" },
              },
            },
          },
          {
            name: "get_recently_eaten_foods",
            description: "Get recently eaten foods for the authenticated user. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                meal: { type: "string", enum: ["breakfast", "lunch", "dinner", "other"], description: "Filter by meal type" },
              },
            },
          },
          {
            name: "add_recipe_favorite",
            description: "Add a recipe to user's favorites. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                recipeId: { type: "string", description: "The recipe ID to add to favorites" },
              },
              required: ["recipeId"],
            },
          },
          {
            name: "delete_recipe_favorite",
            description: "Remove a recipe from user's favorites. Requires OAuth authentication.",
            inputSchema: {
              type: "object",
              properties: {
                recipeId: { type: "string", description: "The recipe ID to remove from favorites" },
              },
              required: ["recipeId"],
            },
          },
          {
            name: "get_favorite_recipes",
            description: "Get all favorite recipes for the authenticated user. Requires OAuth authentication.",
            inputSchema: { type: "object", properties: {} },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.loadConfig();

      const args = request.params.arguments as unknown;
      try {
        switch (request.params.name) {
          case "set_credentials":
            return await this.handleSetCredentials(args as SetCredentialsInput);
          case "start_oauth_flow":
            return await this.handleStartOAuthFlow(args as StartOAuthFlowInput | undefined);
          case "complete_oauth_flow":
            return await this.handleCompleteOAuthFlow(args as CompleteOAuthFlowInput);
          case "search_foods":
            return await this.handleSearchFoods(args as SearchFoodsInput);
          case "get_food":
            return await this.handleGetFood(args as GetFoodInput);
          case "search_recipes":
            return await this.handleSearchRecipes(args as SearchRecipesInput);
          case "get_recipe":
            return await this.handleGetRecipe(args as GetRecipeInput);
          case "get_user_profile":
            return await this.handleGetUserProfile();
          case "get_user_food_entries":
            return await this.handleGetUserFoodEntries(args as GetFoodEntriesInput | undefined);
          case "add_food_entry":
            return await this.handleAddFoodEntry(args as AddFoodEntryInput);
          case "check_auth_status":
            return await this.handleCheckAuthStatus();
          case "get_weight_month":
            return await this.handleGetWeightMonth(args as GetWeightMonthInput | undefined);
          case "edit_food_entry":
            return await this.handleEditFoodEntry(args as EditFoodEntryInput);
          case "delete_food_entry":
            return await this.handleDeleteFoodEntry(args as DeleteFoodEntryInput);
          case "get_food_entries_month":
            return await this.handleGetFoodEntriesMonth(args as GetFoodEntriesMonthInput | undefined);
          case "update_weight":
            return await this.handleUpdateWeight(args as UpdateWeightInput);
          case "get_saved_meals":
            return await this.handleGetSavedMeals(args as GetSavedMealsInput | undefined);
          case "create_saved_meal":
            return await this.handleCreateSavedMeal(args as CreateSavedMealInput);
          case "edit_saved_meal":
            return await this.handleEditSavedMeal(args as EditSavedMealInput);
          case "delete_saved_meal":
            return await this.handleDeleteSavedMeal(args as DeleteSavedMealInput);
          case "get_saved_meal_items":
            return await this.handleGetSavedMealItems(args as GetSavedMealItemsInput);
          case "add_saved_meal_item":
            return await this.handleAddSavedMealItem(args as AddSavedMealItemInput);
          case "edit_saved_meal_item":
            return await this.handleEditSavedMealItem(args as EditSavedMealItemInput);
          case "delete_saved_meal_item":
            return await this.handleDeleteSavedMealItem(args as DeleteSavedMealItemInput);
          case "add_food_favorite":
            return await this.handleAddFoodFavorite(args as AddFoodFavoriteInput);
          case "delete_food_favorite":
            return await this.handleDeleteFoodFavorite(args as DeleteFoodFavoriteInput);
          case "get_favorite_foods":
            return await this.handleGetFavoriteFoods();
          case "get_most_eaten_foods":
            return await this.handleGetMostEatenFoods(args as GetMostEatenInput | undefined);
          case "get_recently_eaten_foods":
            return await this.handleGetRecentlyEatenFoods(args as GetRecentlyEatenInput | undefined);
          case "add_recipe_favorite":
            return await this.handleAddRecipeFavorite(args as AddRecipeFavoriteInput);
          case "delete_recipe_favorite":
            return await this.handleDeleteRecipeFavorite(args as DeleteRecipeFavoriteInput);
          case "get_favorite_recipes":
            return await this.handleGetFavoriteRecipes();
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (error instanceof McpError) throw error;
        throw new McpError(
          ErrorCode.InternalError,
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });
  }

  private async handleSetCredentials(args: SetCredentialsInput) {
    this.client.updateConfig({
      clientId: args.clientId,
      clientSecret: args.clientSecret,
    });
    await this.saveConfig();

    return {
      content: [{
        type: "text",
        text: "FatSecret API credentials have been set successfully. You can now start the OAuth flow to authenticate users.",
      }],
    };
  }

  private async handleStartOAuthFlow(args?: StartOAuthFlowInput) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first using set_credentials");
    }

    const callbackUrl = args?.callbackUrl || "oob";
    const response = await this.client.getRequestToken(callbackUrl);

    const token = response.oauth_token as string;
    const tokenSecret = response.oauth_token_secret as string;
    const authUrl = `${this.client.authorizeUrl}?oauth_token=${token}`;

    return {
      content: [{
        type: "text",
        text: `OAuth flow started successfully!\n\nRequest Token: ${token}\nRequest Token Secret: ${tokenSecret}\n\nPlease visit this URL to authorize the application:\n${authUrl}\n\nAfter authorization, you'll receive a verifier code. Use the complete_oauth_flow tool with the request token, request token secret, and verifier to complete the authentication.`,
      }],
    };
  }

  private async handleCompleteOAuthFlow(args: CompleteOAuthFlowInput) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.getAccessToken(
      args.requestToken,
      args.requestTokenSecret,
      args.verifier
    );

    this.client.updateConfig({
      accessToken: response.oauth_token,
      accessTokenSecret: response.oauth_token_secret,
      userId: response.user_id,
    });
    await this.saveConfig();

    return {
      content: [{
        type: "text",
        text: `OAuth flow completed successfully! You are now authenticated with FatSecret.\n\nUser ID: ${response.user_id}\n\nYou can now use user-specific tools like get_user_profile, get_user_food_entries, and add_food_entry.`,
      }],
    };
  }

  private async handleSearchFoods(args: SearchFoodsInput) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.searchFoods(args.searchExpression, {
      pageNumber: args.pageNumber,
      maxResults: args.maxResults,
      region: args.region,
      language: args.language,
    });

    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetFood(args: GetFoodInput) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.getFood(args.foodId, {
      region: args.region,
      language: args.language,
    });
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleSearchRecipes(args: SearchRecipesInput) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.searchRecipes(args.searchExpression, {
      recipeTypes: args.recipeTypes,
      recipeTypesMatchAll: args.recipeTypesMatchAll,
      mustHaveImages: args.mustHaveImages,
      caloriesFrom: args.caloriesFrom,
      caloriesTo: args.caloriesTo,
      carbPercentageFrom: args.carbPercentageFrom,
      carbPercentageTo: args.carbPercentageTo,
      proteinPercentageFrom: args.proteinPercentageFrom,
      proteinPercentageTo: args.proteinPercentageTo,
      fatPercentageFrom: args.fatPercentageFrom,
      fatPercentageTo: args.fatPercentageTo,
      prepTimeFrom: args.prepTimeFrom,
      prepTimeTo: args.prepTimeTo,
      sortBy: args.sortBy,
      pageNumber: args.pageNumber,
      maxResults: args.maxResults,
    });

    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetRecipe(args: GetRecipeInput) {
    if (!this.client.hasCredentials()) {
      throw new McpError(ErrorCode.InvalidRequest, "Please set your FatSecret API credentials first");
    }

    const response = await this.client.getRecipe(args.recipeId, {
      language: args.language,
    });
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetUserProfile() {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getProfile();
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetUserFoodEntries(args?: GetFoodEntriesInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getFoodEntries(args?.date);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleAddFoodEntry(args: AddFoodEntryInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.createFoodEntry({
      foodId: args.foodId,
      foodName: args.foodName,
      servingId: args.servingId,
      quantity: args.quantity,
      mealType: args.mealType,
      date: args.date,
    });

    return {
      content: [{
        type: "text",
        text: `Food entry added successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleCheckAuthStatus() {
    const config = this.client.getConfig();
    const hasCredentials = this.client.hasCredentials();
    const hasAccessToken = this.client.hasAccessToken();

    let status = "Not configured";
    if (hasCredentials && hasAccessToken) {
      status = "Fully authenticated";
    } else if (hasCredentials) {
      status = "Credentials set, authentication needed";
    }

    return {
      content: [{
        type: "text",
        text: `Authentication Status: ${status}\n\nCredentials configured: ${hasCredentials}\nUser authenticated: ${hasAccessToken}\nUser ID: ${config.userId || "N/A"}`,
      }],
    };
  }

  private async handleGetWeightMonth(args?: GetWeightMonthInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getWeightMonth(args?.date);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleEditFoodEntry(args: EditFoodEntryInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.editFoodEntry({
      foodEntryId: args.foodEntryId,
      foodName: args.foodName,
      servingId: args.servingId,
      quantity: args.quantity,
      mealType: args.mealType,
    });

    return {
      content: [{
        type: "text",
        text: `Food entry updated successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleDeleteFoodEntry(args: DeleteFoodEntryInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.deleteFoodEntry(args.foodEntryId);

    return {
      content: [{
        type: "text",
        text: `Food entry deleted successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleGetFoodEntriesMonth(args?: GetFoodEntriesMonthInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getFoodEntriesMonth(args?.date);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleUpdateWeight(args: UpdateWeightInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.updateWeight({
      currentWeightKg: args.currentWeightKg,
      date: args.date,
      weightType: args.weightType,
      heightType: args.heightType,
      goalWeightKg: args.goalWeightKg,
      currentHeightCm: args.currentHeightCm,
      comment: args.comment,
    });

    return {
      content: [{
        type: "text",
        text: `Weight entry updated successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleGetSavedMeals(args?: GetSavedMealsInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getSavedMeals(args?.meal);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleCreateSavedMeal(args: CreateSavedMealInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.createSavedMeal({
      name: args.name,
      description: args.description,
      meals: args.meals,
    });

    return {
      content: [{
        type: "text",
        text: `Saved meal created successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleEditSavedMeal(args: EditSavedMealInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.editSavedMeal({
      savedMealId: args.savedMealId,
      name: args.name,
      description: args.description,
      meals: args.meals,
    });

    return {
      content: [{
        type: "text",
        text: `Saved meal updated successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleDeleteSavedMeal(args: DeleteSavedMealInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.deleteSavedMeal(args.savedMealId);

    return {
      content: [{
        type: "text",
        text: `Saved meal deleted successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleGetSavedMealItems(args: GetSavedMealItemsInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getSavedMealItems(args.savedMealId);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleAddSavedMealItem(args: AddSavedMealItemInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.addSavedMealItem({
      savedMealId: args.savedMealId,
      foodId: args.foodId,
      itemName: args.itemName,
      servingId: args.servingId,
      quantity: args.quantity,
    });

    return {
      content: [{
        type: "text",
        text: `Item added to saved meal successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleEditSavedMealItem(args: EditSavedMealItemInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.editSavedMealItem({
      savedMealItemId: args.savedMealItemId,
      itemName: args.itemName,
      quantity: args.quantity,
    });

    return {
      content: [{
        type: "text",
        text: `Saved meal item updated successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleDeleteSavedMealItem(args: DeleteSavedMealItemInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.deleteSavedMealItem(args.savedMealItemId);

    return {
      content: [{
        type: "text",
        text: `Saved meal item deleted successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleAddFoodFavorite(args: AddFoodFavoriteInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.addFoodFavorite({
      foodId: args.foodId,
      servingId: args.servingId,
      quantity: args.quantity,
    });

    return {
      content: [{
        type: "text",
        text: `Food added to favorites successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleDeleteFoodFavorite(args: DeleteFoodFavoriteInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.deleteFoodFavorite({
      foodId: args.foodId,
      servingId: args.servingId,
      quantity: args.quantity,
    });

    return {
      content: [{
        type: "text",
        text: `Food removed from favorites successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleGetFavoriteFoods() {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getFavoriteFoods();
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetMostEatenFoods(args?: GetMostEatenInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getMostEatenFoods(args?.meal);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleGetRecentlyEatenFoods(args?: GetRecentlyEatenInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getRecentlyEatenFoods(args?.meal);
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  private async handleAddRecipeFavorite(args: AddRecipeFavoriteInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.addRecipeFavorite(args.recipeId);

    return {
      content: [{
        type: "text",
        text: `Recipe added to favorites successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleDeleteRecipeFavorite(args: DeleteRecipeFavoriteInput) {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.deleteRecipeFavorite(args.recipeId);

    return {
      content: [{
        type: "text",
        text: `Recipe removed from favorites successfully!\n\n${JSON.stringify(response, null, 2)}`,
      }],
    };
  }

  private async handleGetFavoriteRecipes() {
    if (!this.client.hasAccessToken()) {
      throw new McpError(ErrorCode.InvalidRequest, "User authentication required. Please complete the OAuth flow first.");
    }

    const response = await this.client.getFavoriteRecipes();
    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("FatSecret MCP server running on stdio");
  }
}

const server = new FatSecretMCPServer();
server.run().catch(console.error);
