import { describe, it, expect, beforeEach } from "vitest";
import { hasCredentials, config, API_TIMEOUT, waitForRateLimit } from "./setup.js";
import { searchFoods, getFood } from "../../methods/foods.js";

beforeEach(async () => {
  await waitForRateLimit();
});

describe.skipIf(!hasCredentials)("Foods Integration Tests", () => {
  describe("searchFoods", () => {
    it(
      "should return foods for 'apple' query",
      async () => {
        const result = await searchFoods(config, "apple", { maxResults: 5 });

        expect(result).toBeDefined();
        expect(result.foods).toBeDefined();
        expect(result.foods.food).toBeDefined();
        expect(result.foods.food.length).toBeGreaterThan(0);
        expect(result.foods.total_results).toBeDefined();
        expect(parseInt(result.foods.total_results)).toBeGreaterThan(0);

        // Verify food item structure
        const firstFood = result.foods.food[0];
        expect(firstFood.food_id).toBeDefined();
        expect(firstFood.food_name).toBeDefined();
        expect(firstFood.food_type).toBeDefined();
        expect(firstFood.food_description).toBeDefined();
      },
      API_TIMEOUT
    );

    it(
      "should return foods for 'chicken breast' query",
      async () => {
        const result = await searchFoods(config, "chicken breast", { maxResults: 10 });

        expect(result.foods.food).toBeDefined();
        expect(result.foods.food.length).toBeGreaterThan(0);

        // Check that search term is relevant to results
        const foodNames = result.foods.food.map((f) => f.food_name.toLowerCase());
        const hasRelevantResult = foodNames.some(
          (name) => name.includes("chicken") || name.includes("breast")
        );
        expect(hasRelevantResult).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should respect maxResults parameter",
      async () => {
        const maxResults = 3;
        const result = await searchFoods(config, "bread", { maxResults });

        expect(result.foods.food.length).toBeLessThanOrEqual(maxResults);
        expect(result.foods.max_results).toBe(maxResults.toString());
      },
      API_TIMEOUT
    );

    it(
      "should support pagination",
      async () => {
        const page0 = await searchFoods(config, "rice", { maxResults: 5, pageNumber: 0 });
        const page1 = await searchFoods(config, "rice", { maxResults: 5, pageNumber: 1 });

        expect(page0.foods.page_number).toBe("0");
        expect(page1.foods.page_number).toBe("1");

        // Results should be different between pages
        if (page0.foods.food.length > 0 && page1.foods.food.length > 0) {
          const page0Ids = page0.foods.food.map((f) => f.food_id);
          const page1Ids = page1.foods.food.map((f) => f.food_id);
          const hasOverlap = page0Ids.some((id) => page1Ids.includes(id));
          expect(hasOverlap).toBe(false);
        }
      },
      API_TIMEOUT
    );

    it(
      "should handle empty results gracefully",
      async () => {
        const result = await searchFoods(config, "xyznonexistentfood12345", { maxResults: 5 });

        expect(result.foods).toBeDefined();
        expect(result.foods.total_results).toBe("0");
        // Empty results should return empty array
        expect(result.foods.food).toEqual([]);
      },
      API_TIMEOUT
    );
  });

  describe("getFood", () => {
    it(
      "should return food details by ID",
      async () => {
        // First search for a food to get a valid ID
        const searchResult = await searchFoods(config, "banana", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const result = await getFood(config, foodId);

        expect(result).toBeDefined();
        expect(result.food).toBeDefined();
        expect(result.food.food_id).toBe(foodId);
        expect(result.food.food_name).toBeDefined();
        expect(result.food.food_type).toBeDefined();
      },
      API_TIMEOUT
    );

    it(
      "should return servings information",
      async () => {
        // Search for a common food
        const searchResult = await searchFoods(config, "egg", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const result = await getFood(config, foodId);

        expect(result.food.servings).toBeDefined();
        expect(result.food.servings.serving).toBeDefined();
        expect(result.food.servings.serving.length).toBeGreaterThan(0);

        // Verify serving structure
        const firstServing = result.food.servings.serving[0];
        expect(firstServing.serving_id).toBeDefined();
        expect(firstServing.serving_description).toBeDefined();
        expect(firstServing.calories).toBeDefined();
        expect(firstServing.protein).toBeDefined();
        expect(firstServing.fat).toBeDefined();
        expect(firstServing.carbohydrate).toBeDefined();
      },
      API_TIMEOUT
    );

    it(
      "should include nutritional data",
      async () => {
        // Search for a specific food
        const searchResult = await searchFoods(config, "orange", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const result = await getFood(config, foodId);

        const serving = result.food.servings.serving[0];

        // Nutritional values should be valid numbers (as strings)
        expect(parseFloat(serving.calories)).toBeGreaterThanOrEqual(0);
        expect(parseFloat(serving.protein)).toBeGreaterThanOrEqual(0);
        expect(parseFloat(serving.fat)).toBeGreaterThanOrEqual(0);
        expect(parseFloat(serving.carbohydrate)).toBeGreaterThanOrEqual(0);
      },
      API_TIMEOUT
    );

    it(
      "should handle branded foods",
      async () => {
        // Search for a branded food
        const searchResult = await searchFoods(config, "coca cola", { maxResults: 5 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        // Find a brand food
        const brandFood = searchResult.foods.food.find((f) => f.food_type === "Brand");

        if (brandFood) {
          const result = await getFood(config, brandFood.food_id);
          expect(result.food.food_type).toBe("Brand");
          expect(result.food.brand_name).toBeDefined();
        }
      },
      API_TIMEOUT
    );
  });

  // NOTE: autocompleteFood and findFoodByBarcode tests removed - require OAuth 2.0
});
