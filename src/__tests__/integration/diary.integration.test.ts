import { describe, it, expect, beforeEach } from "vitest";
import { hasAuthTokens, authConfig, API_TIMEOUT, waitForRateLimit } from "./setup.js";
import {
  getFoodEntries,
  createFoodEntry,
  editFoodEntry,
  deleteFoodEntry,
  getFoodEntriesMonth,
} from "../../methods/diary.js";
import type { EditFoodEntryParams } from "../../types.js";

beforeEach(async () => {
  await waitForRateLimit();
});

describe.skipIf(!hasAuthTokens)("Diary Integration Tests", () => {
  describe("getFoodEntries", () => {
    it(
      "should return food entries for today",
      async () => {
        const result = await getFoodEntries(authConfig);

        expect(result).toBeDefined();
        expect(result.food_entries).toBeDefined();
        // food_entry should be an array (possibly empty)
        expect(result.food_entries.food_entry).toBeDefined();
        expect(Array.isArray(result.food_entries.food_entry)).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should return food entries for specific date",
      async () => {
        // Use a date format that the API accepts (YYYY-MM-DD)
        const date = "2024-01-15";
        const result = await getFoodEntries(authConfig, date);

        expect(result).toBeDefined();
        expect(result.food_entries).toBeDefined();
        expect(Array.isArray(result.food_entries.food_entry)).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should return empty array for date with no entries",
      async () => {
        // Use an old date unlikely to have entries
        const date = "2010-01-01";
        const result = await getFoodEntries(authConfig, date);

        expect(result.food_entries).toBeDefined();
        expect(result.food_entries.food_entry).toEqual([]);
      },
      API_TIMEOUT
    );

    it(
      "should return valid food entry structure when entries exist",
      async () => {
        const result = await getFoodEntries(authConfig);

        if (result.food_entries.food_entry.length > 0) {
          const entry = result.food_entries.food_entry[0];

          // Required fields
          expect(entry.food_entry_id).toBeDefined();
          expect(entry.food_id).toBeDefined();
          expect(entry.food_entry_name).toBeDefined();
          expect(entry.serving_id).toBeDefined();
          expect(entry.number_of_units).toBeDefined();
          expect(entry.meal).toBeDefined();
          expect(entry.date_int).toBeDefined();

          // Meal should be one of the valid types (API returns capitalized)
          expect(["breakfast", "lunch", "dinner", "other"]).toContain(entry.meal.toLowerCase());
        }
      },
      API_TIMEOUT
    );

    it(
      "should return nutritional data when entries exist",
      async () => {
        const result = await getFoodEntries(authConfig);

        if (result.food_entries.food_entry.length > 0) {
          const entry = result.food_entries.food_entry[0];

          // Nutritional data should be valid if present
          if (entry.calories) {
            expect(parseFloat(entry.calories)).toBeGreaterThanOrEqual(0);
          }
          if (entry.protein) {
            expect(parseFloat(entry.protein)).toBeGreaterThanOrEqual(0);
          }
          if (entry.fat) {
            expect(parseFloat(entry.fat)).toBeGreaterThanOrEqual(0);
          }
          if (entry.carbohydrate) {
            expect(parseFloat(entry.carbohydrate)).toBeGreaterThanOrEqual(0);
          }
        }
      },
      API_TIMEOUT
    );
  });

  describe("createFoodEntry", () => {
    // Skip createFoodEntry tests by default to avoid modifying user data
    // Uncomment and configure if you want to test creation

    it(
      "should create a food entry",
      async () => {
        // First get a valid food_id and serving_id from search
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "apple", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        const params = {
          foodId,
          foodName: "Apple - Integration Test",
          servingId,
          quantity: 1,
          mealType: "other" as const,
        };

        const result = await createFoodEntry(authConfig, params);

        expect(result).toBeDefined();
        expect(result.food_entry_id).toBeDefined();
        expect(result.food_entry_id.value).toBeDefined();
        expect(parseInt(result.food_entry_id.value)).toBeGreaterThan(0);
      },
      API_TIMEOUT
    );

    it(
      "should create food entry with specific date",
      async () => {
        // Get a valid food_id and serving_id
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "banana", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        const params = {
          foodId,
          foodName: "Banana - Date Test",
          servingId,
          quantity: 0.5,
          mealType: "breakfast" as const,
          date: "2024-12-25",
        };

        const result = await createFoodEntry(authConfig, params);

        expect(result).toBeDefined();
        expect(result.food_entry_id).toBeDefined();
        expect(result.food_entry_id.value).toBeDefined();
      },
      API_TIMEOUT
    );
  });

  describe("getFoodEntriesMonth", () => {
    it(
      "should return monthly food entries summary for current month",
      async () => {
        const result = await getFoodEntriesMonth(authConfig);

        expect(result).toBeDefined();
        expect(result.month).toBeDefined();
        expect(result.month.from_date_int).toBeDefined();
        expect(result.month.to_date_int).toBeDefined();
        expect(Array.isArray(result.month.day)).toBe(true);
      },
      API_TIMEOUT
    );

    it(
      "should return monthly food entries for a specific month",
      async () => {
        // Use a specific date - the API will return the entire month
        const date = "2024-06-15";
        const result = await getFoodEntriesMonth(authConfig, date);

        expect(result).toBeDefined();
        expect(result.month).toBeDefined();
        expect(result.month.from_date_int).toBeDefined();
        expect(result.month.to_date_int).toBeDefined();
        expect(Array.isArray(result.month.day)).toBe(true);

        // Verify from_date_int and to_date_int are valid numeric strings (days since epoch)
        // June 1, 2024 = 19875 days since epoch, June 30, 2024 = 19904 days since epoch
        const fromDateInt = parseInt(result.month.from_date_int);
        const toDateInt = parseInt(result.month.to_date_int);

        expect(fromDateInt).toBeGreaterThan(0);
        expect(toDateInt).toBeGreaterThan(0);
        expect(toDateInt).toBeGreaterThanOrEqual(fromDateInt);

        // The date range should span approximately one month (28-31 days)
        const dateRange = toDateInt - fromDateInt;
        expect(dateRange).toBeGreaterThanOrEqual(27);
        expect(dateRange).toBeLessThanOrEqual(31);
      },
      API_TIMEOUT
    );

    it(
      "should return empty day array for month with no entries",
      async () => {
        // Use an old date unlikely to have any entries
        const date = "2010-03-15";
        const result = await getFoodEntriesMonth(authConfig, date);

        expect(result).toBeDefined();
        expect(result.month).toBeDefined();
        expect(result.month.day).toEqual([]);
      },
      API_TIMEOUT
    );

    it(
      "should return valid day summary structure when entries exist",
      async () => {
        const result = await getFoodEntriesMonth(authConfig);

        if (result.month.day.length > 0) {
          const daySummary = result.month.day[0];

          // Required field
          expect(daySummary.date_int).toBeDefined();

          // Nutritional data should be valid if present
          if (daySummary.calories) {
            expect(parseFloat(daySummary.calories)).toBeGreaterThanOrEqual(0);
          }
          if (daySummary.protein) {
            expect(parseFloat(daySummary.protein)).toBeGreaterThanOrEqual(0);
          }
          if (daySummary.fat) {
            expect(parseFloat(daySummary.fat)).toBeGreaterThanOrEqual(0);
          }
          if (daySummary.carbohydrate) {
            expect(parseFloat(daySummary.carbohydrate)).toBeGreaterThanOrEqual(0);
          }
        }
      },
      API_TIMEOUT
    );
  });

  describe("editFoodEntry", () => {
    it(
      "should edit an existing food entry - change meal type",
      async () => {
        // Step 1: Create a food entry to edit
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "orange", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        const createParams = {
          foodId,
          foodName: "Orange - Edit Test",
          servingId,
          quantity: 1,
          mealType: "breakfast" as const,
        };

        const createResult = await createFoodEntry(authConfig, createParams);
        expect(createResult.food_entry_id.value).toBeDefined();
        const foodEntryId = createResult.food_entry_id.value;

        // Step 2: Edit the entry - change meal type
        const editParams: EditFoodEntryParams = {
          foodEntryId,
          mealType: "lunch",
        };

        const editResult = await editFoodEntry(authConfig, editParams);

        expect(editResult).toBeDefined();
        expect(editResult.success).toBeDefined();
        expect(editResult.success.value).toBeDefined();

        // Clean up: delete the test entry
        await deleteFoodEntry(authConfig, foodEntryId);
      },
      API_TIMEOUT
    );

    it(
      "should edit an existing food entry - change quantity",
      async () => {
        // Step 1: Create a food entry to edit
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "grape", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        const createParams = {
          foodId,
          foodName: "Grape - Quantity Edit Test",
          servingId,
          quantity: 1,
          mealType: "other" as const,
        };

        const createResult = await createFoodEntry(authConfig, createParams);
        const foodEntryId = createResult.food_entry_id.value;

        // Step 2: Edit the entry - change quantity
        const editParams: EditFoodEntryParams = {
          foodEntryId,
          quantity: 2.5,
        };

        const editResult = await editFoodEntry(authConfig, editParams);

        expect(editResult).toBeDefined();
        expect(editResult.success).toBeDefined();
        expect(editResult.success.value).toBeDefined();

        // Clean up: delete the test entry
        await deleteFoodEntry(authConfig, foodEntryId);
      },
      API_TIMEOUT
    );

    it(
      "should edit an existing food entry - change multiple fields",
      async () => {
        // Step 1: Create a food entry to edit
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "strawberry", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        const createParams = {
          foodId,
          foodName: "Strawberry - Multi Edit Test",
          servingId,
          quantity: 1,
          mealType: "breakfast" as const,
        };

        const createResult = await createFoodEntry(authConfig, createParams);
        const foodEntryId = createResult.food_entry_id.value;

        // Step 2: Edit the entry - change multiple fields
        const editParams: EditFoodEntryParams = {
          foodEntryId,
          foodName: "Strawberry - Updated Name",
          quantity: 3,
          mealType: "dinner",
        };

        const editResult = await editFoodEntry(authConfig, editParams);

        expect(editResult).toBeDefined();
        expect(editResult.success).toBeDefined();
        expect(editResult.success.value).toBeDefined();

        // Clean up: delete the test entry
        await deleteFoodEntry(authConfig, foodEntryId);
      },
      API_TIMEOUT
    );
  });

  describe("deleteFoodEntry", () => {
    it(
      "should delete a food entry",
      async () => {
        // Step 1: Create a food entry to delete
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "mango", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        const createParams = {
          foodId,
          foodName: "Mango - Delete Test",
          servingId,
          quantity: 1,
          mealType: "other" as const,
        };

        const createResult = await createFoodEntry(authConfig, createParams);
        const foodEntryId = createResult.food_entry_id.value;
        expect(foodEntryId).toBeDefined();

        // Step 2: Delete the entry
        const deleteResult = await deleteFoodEntry(authConfig, foodEntryId);

        expect(deleteResult).toBeDefined();
        expect(deleteResult.success).toBeDefined();
        expect(deleteResult.success.value).toBeDefined();
      },
      API_TIMEOUT
    );

    it(
      "should verify deleted entry no longer exists",
      async () => {
        // Step 1: Create a food entry with a specific date
        const { searchFoods, getFood } = await import("../../methods/foods.js");
        const searchResult = await searchFoods(authConfig, "pineapple", { maxResults: 1 });
        expect(searchResult.foods.food.length).toBeGreaterThan(0);

        const foodId = searchResult.foods.food[0].food_id;
        const foodDetails = await getFood(authConfig, foodId);
        const servingId = foodDetails.food.servings.serving[0].serving_id;

        // Use a specific date for easier verification
        const testDate = "2024-12-31";
        const createParams = {
          foodId,
          foodName: "Pineapple - Verify Delete Test",
          servingId,
          quantity: 1,
          mealType: "lunch" as const,
          date: testDate,
        };

        const createResult = await createFoodEntry(authConfig, createParams);
        const foodEntryId = createResult.food_entry_id.value;

        // Step 2: Verify entry exists
        const entriesBefore = await getFoodEntries(authConfig, testDate);
        const entryExistsBefore = entriesBefore.food_entries.food_entry.some(
          (entry) => entry.food_entry_id === foodEntryId
        );
        expect(entryExistsBefore).toBe(true);

        // Step 3: Delete the entry
        const deleteResult = await deleteFoodEntry(authConfig, foodEntryId);
        expect(deleteResult.success.value).toBeDefined();

        // Step 4: Verify entry no longer exists
        const entriesAfter = await getFoodEntries(authConfig, testDate);
        const entryExistsAfter = entriesAfter.food_entries.food_entry.some(
          (entry) => entry.food_entry_id === foodEntryId
        );
        expect(entryExistsAfter).toBe(false);
      },
      API_TIMEOUT
    );
  });
});
