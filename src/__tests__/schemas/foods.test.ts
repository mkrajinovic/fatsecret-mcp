import { describe, it, expect } from "vitest";
import {
  FoodSearchResponseSchema,
  FoodDetailResponseSchema,
} from "../../schemas/foods.js";

describe("FoodSearchResponseSchema", () => {
  it("should validate valid food search response", () => {
    const validResponse = {
      foods: {
        food: [
          {
            food_id: "123",
            food_name: "Apple",
            food_type: "Generic",
            food_description: "Per 100g - Calories: 52kcal",
          },
        ],
        max_results: "20",
        page_number: "0",
        total_results: "100",
      },
    };

    const result = FoodSearchResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.foods.food)).toBe(true);
    }
  });

  it("should normalize single food to array", () => {
    const responseWithSingleFood = {
      foods: {
        food: {
          food_id: "123",
          food_name: "Apple",
          food_type: "Generic",
          food_description: "Per 100g",
        },
        max_results: "20",
        page_number: "0",
        total_results: "1",
      },
    };

    const result = FoodSearchResponseSchema.safeParse(responseWithSingleFood);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.foods.food)).toBe(true);
      expect(result.data.foods.food).toHaveLength(1);
    }
  });

  it("should handle empty food array (no results)", () => {
    const emptyResponse = {
      foods: {
        max_results: "20",
        page_number: "0",
        total_results: "0",
      },
    };

    const result = FoodSearchResponseSchema.safeParse(emptyResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      // optionalSingleOrArray returns [] when undefined
      expect(result.data.foods.food).toEqual([]);
    }
  });

  it("should handle food with images and attributes", () => {
    const responseWithExtras = {
      foods: {
        food: [
          {
            food_id: "123",
            food_name: "Apple",
            food_type: "Generic",
            food_description: "Per 100g - Calories: 52kcal",
            food_images: {
              food_image: [
                { image_url: "https://example.com/apple.jpg", image_type: "main" },
              ],
            },
            food_attributes: {
              allergens: {
                allergen: [
                  { id: "1", name: "Gluten", value: 0 },
                ],
              },
              preferences: {
                preference: [
                  { id: "1", name: "Vegan", value: 1 },
                ],
              },
            },
            food_sub_categories: ["Fruits", "Fresh Produce"],
          },
        ],
        max_results: "20",
        page_number: "0",
        total_results: "1",
      },
    };

    const result = FoodSearchResponseSchema.safeParse(responseWithExtras);
    expect(result.success).toBe(true);
    if (result.success) {
      const food = result.data.foods.food?.[0];
      expect(food?.food_images?.food_image).toHaveLength(1);
      expect(food?.food_attributes?.allergens?.allergen).toHaveLength(1);
      expect(food?.food_attributes?.preferences?.preference).toHaveLength(1);
      expect(food?.food_sub_categories).toHaveLength(2);
    }
  });
});

describe("FoodDetailResponseSchema", () => {
  it("should validate valid food detail response", () => {
    const validResponse = {
      food: {
        food_id: "12345",
        food_name: "Apple",
        food_type: "Generic",
        servings: {
          serving: [
            {
              serving_id: "1",
              serving_description: "1 medium",
              calories: "95",
              fat: "0.3",
              carbohydrate: "25",
              protein: "0.5",
            },
          ],
        },
      },
    };

    const result = FoodDetailResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should normalize single serving to array", () => {
    const responseWithSingleServing = {
      food: {
        food_id: "12345",
        food_name: "Apple",
        food_type: "Generic",
        servings: {
          serving: {
            serving_id: "1",
            serving_description: "1 medium",
            calories: "95",
            fat: "0.3",
            carbohydrate: "25",
            protein: "0.5",
          },
        },
      },
    };

    const result = FoodDetailResponseSchema.safeParse(responseWithSingleServing);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.food.servings.serving)).toBe(true);
    }
  });
});
