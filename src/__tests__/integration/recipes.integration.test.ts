import { describe, it, expect, beforeEach } from "vitest";
import { hasCredentials, config, API_TIMEOUT, waitForRateLimit } from "./setup.js";
import { searchRecipes, getRecipe } from "../../methods/recipes.js";

beforeEach(async () => {
  await waitForRateLimit();
});

describe.skipIf(!hasCredentials)("Recipes Integration Tests", () => {
  describe("searchRecipes", () => {
    it(
      "should return recipes for 'pasta' query",
      async () => {
        const result = await searchRecipes(config, "pasta", { maxResults: 5 });

        expect(result).toBeDefined();
        expect(result.recipes).toBeDefined();
        expect(result.recipes.recipe).toBeDefined();
        expect(result.recipes.recipe.length).toBeGreaterThan(0);
        expect(result.recipes.total_results).toBeDefined();
        expect(parseInt(result.recipes.total_results)).toBeGreaterThan(0);

        // Verify recipe item structure
        const firstRecipe = result.recipes.recipe[0];
        expect(firstRecipe.recipe_id).toBeDefined();
        expect(firstRecipe.recipe_name).toBeDefined();
        expect(firstRecipe.recipe_description).toBeDefined();
      },
      API_TIMEOUT
    );

    it(
      "should return recipes for 'chicken soup' query",
      async () => {
        const result = await searchRecipes(config, "chicken soup", { maxResults: 10 });

        expect(result.recipes.recipe).toBeDefined();
        expect(result.recipes.recipe.length).toBeGreaterThan(0);

        // Check that search term is relevant to results
        const recipeNames = result.recipes.recipe.map((r) => r.recipe_name.toLowerCase());
        const hasRelevantResult = recipeNames.some(
          (name) => name.includes("chicken") || name.includes("soup")
        );
        expect(hasRelevantResult).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should respect maxResults parameter",
      async () => {
        const maxResults = 3;
        const result = await searchRecipes(config, "salad", { maxResults });

        expect(result.recipes.recipe.length).toBeLessThanOrEqual(maxResults);
        expect(result.recipes.max_results).toBe(maxResults.toString());
      },
      API_TIMEOUT
    );

    it(
      "should support pagination",
      async () => {
        const page0 = await searchRecipes(config, "cake", { maxResults: 5, pageNumber: 0 });
        const page1 = await searchRecipes(config, "cake", { maxResults: 5, pageNumber: 1 });

        expect(page0.recipes.page_number).toBe("0");
        expect(page1.recipes.page_number).toBe("1");

        // Results should be different between pages
        if (page0.recipes.recipe.length > 0 && page1.recipes.recipe.length > 0) {
          const page0Ids = page0.recipes.recipe.map((r) => r.recipe_id);
          const page1Ids = page1.recipes.recipe.map((r) => r.recipe_id);
          const hasOverlap = page0Ids.some((id) => page1Ids.includes(id));
          expect(hasOverlap).toBe(false);
        }
      },
      API_TIMEOUT
    );

    it(
      "should accept calories range parameters",
      async () => {
        // Note: FatSecret API may not strictly filter by calories range
        // This test verifies the API accepts these parameters without error
        const result = await searchRecipes(config, "breakfast", {
          maxResults: 5,
          caloriesFrom: 100,
          caloriesTo: 500,
        });

        expect(result.recipes).toBeDefined();
        expect(result.recipes.recipe).toBeDefined();
        // API should return results (may not be strictly filtered)
        expect(Array.isArray(result.recipes.recipe)).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should handle empty results gracefully",
      async () => {
        const result = await searchRecipes(config, "xyznonexistentrecipe12345", { maxResults: 5 });

        expect(result.recipes).toBeDefined();
        expect(result.recipes.total_results).toBe("0");
        // Empty results should return empty array
        expect(result.recipes.recipe).toEqual([]);
      },
      API_TIMEOUT
    );
  });

  describe("getRecipe", () => {
    it(
      "should return recipe details by ID",
      async () => {
        // First search for a recipe to get a valid ID
        const searchResult = await searchRecipes(config, "pizza", { maxResults: 1 });
        expect(searchResult.recipes.recipe.length).toBeGreaterThan(0);

        const recipeId = searchResult.recipes.recipe[0].recipe_id;
        const result = await getRecipe(config, recipeId);

        expect(result).toBeDefined();
        expect(result.recipe).toBeDefined();
        expect(result.recipe.recipe_id).toBe(recipeId);
        expect(result.recipe.recipe_name).toBeDefined();
        expect(result.recipe.recipe_description).toBeDefined();
      },
      API_TIMEOUT
    );

    it(
      "should return ingredients information",
      async () => {
        // Search for a recipe
        const searchResult = await searchRecipes(config, "sandwich", { maxResults: 1 });
        expect(searchResult.recipes.recipe.length).toBeGreaterThan(0);

        const recipeId = searchResult.recipes.recipe[0].recipe_id;
        const result = await getRecipe(config, recipeId);

        // Most recipes should have ingredients
        if (result.recipe.ingredients) {
          expect(result.recipe.ingredients.ingredient).toBeDefined();
          if (result.recipe.ingredients.ingredient.length > 0) {
            const firstIngredient = result.recipe.ingredients.ingredient[0];
            expect(firstIngredient.food_id).toBeDefined();
            expect(firstIngredient.food_name).toBeDefined();
            expect(firstIngredient.number_of_units).toBeDefined();
          }
        }
      },
      API_TIMEOUT
    );

    it(
      "should return directions information",
      async () => {
        // Search for a recipe
        const searchResult = await searchRecipes(config, "omelette", { maxResults: 1 });
        expect(searchResult.recipes.recipe.length).toBeGreaterThan(0);

        const recipeId = searchResult.recipes.recipe[0].recipe_id;
        const result = await getRecipe(config, recipeId);

        // Most recipes should have directions
        if (result.recipe.directions) {
          expect(result.recipe.directions.direction).toBeDefined();
          if (result.recipe.directions.direction.length > 0) {
            const firstDirection = result.recipe.directions.direction[0];
            expect(firstDirection.direction_number).toBeDefined();
            expect(firstDirection.direction_description).toBeDefined();
          }
        }
      },
      API_TIMEOUT
    );

    it(
      "should return serving information",
      async () => {
        // Search for a recipe
        const searchResult = await searchRecipes(config, "smoothie", { maxResults: 1 });
        expect(searchResult.recipes.recipe.length).toBeGreaterThan(0);

        const recipeId = searchResult.recipes.recipe[0].recipe_id;
        const result = await getRecipe(config, recipeId);

        // Check for serving sizes / nutritional info
        if (result.recipe.serving_sizes) {
          expect(result.recipe.serving_sizes.serving).toBeDefined();
        }

        // Check for number of servings
        if (result.recipe.number_of_servings) {
          expect(parseInt(result.recipe.number_of_servings)).toBeGreaterThan(0);
        }
      },
      API_TIMEOUT
    );

    it(
      "should return recipe types when available",
      async () => {
        // Search for a recipe
        const searchResult = await searchRecipes(config, "dessert", { maxResults: 5 });
        expect(searchResult.recipes.recipe.length).toBeGreaterThan(0);

        // Find a recipe with types
        for (const searchRecipe of searchResult.recipes.recipe) {
          const result = await getRecipe(config, searchRecipe.recipe_id);
          if (result.recipe.recipe_types) {
            expect(result.recipe.recipe_types.recipe_type).toBeDefined();
            break;
          }
        }
      },
      API_TIMEOUT
    );
  });
});
