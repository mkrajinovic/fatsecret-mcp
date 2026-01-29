import { describe, it, expect } from "vitest";
import {
  RecipeSearchResponseSchema,
  RecipeDetailResponseSchema,
} from "../../schemas/recipes.js";

describe("RecipeSearchResponseSchema", () => {
  it("should validate valid recipe search response", () => {
    const validResponse = {
      recipes: {
        recipe: [
          {
            recipe_id: "123",
            recipe_name: "Chicken Salad",
            recipe_description: "A healthy dish",
          },
        ],
        max_results: "20",
        page_number: "0",
        total_results: "50",
      },
    };

    const result = RecipeSearchResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should normalize single recipe to array", () => {
    const responseWithSingleRecipe = {
      recipes: {
        recipe: {
          recipe_id: "123",
          recipe_name: "Chicken Salad",
          recipe_description: "A healthy dish",
        },
        max_results: "20",
        page_number: "0",
        total_results: "1",
      },
    };

    const result = RecipeSearchResponseSchema.safeParse(responseWithSingleRecipe);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.recipes.recipe)).toBe(true);
    }
  });

  it("should validate recipe with nutrition info", () => {
    const responseWithNutrition = {
      recipes: {
        recipe: [
          {
            recipe_id: "123",
            recipe_name: "Chicken Salad",
            recipe_description: "A healthy dish",
            recipe_nutrition: {
              calories: "350",
              fat: "12",
              carbohydrate: "25",
              protein: "30",
            },
          },
        ],
        max_results: "20",
        page_number: "0",
        total_results: "1",
      },
    };

    const result = RecipeSearchResponseSchema.safeParse(responseWithNutrition);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recipes.recipe?.[0]?.recipe_nutrition?.calories).toBe("350");
    }
  });

  it("should validate recipe with ingredients list", () => {
    const responseWithIngredients = {
      recipes: {
        recipe: [
          {
            recipe_id: "123",
            recipe_name: "Chicken Salad",
            recipe_description: "A healthy dish",
            recipe_ingredients: {
              ingredient: ["Chicken breast", "Lettuce", "Tomatoes"],
            },
          },
        ],
        max_results: "20",
        page_number: "0",
        total_results: "1",
      },
    };

    const result = RecipeSearchResponseSchema.safeParse(responseWithIngredients);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recipes.recipe?.[0]?.recipe_ingredients?.ingredient).toHaveLength(3);
    }
  });

  it("should validate recipe with recipe types", () => {
    const responseWithTypes = {
      recipes: {
        recipe: [
          {
            recipe_id: "123",
            recipe_name: "Chicken Salad",
            recipe_description: "A healthy dish",
            recipe_types: {
              recipe_type: ["Main Dish", "Salad"],
            },
          },
        ],
        max_results: "20",
        page_number: "0",
        total_results: "1",
      },
    };

    const result = RecipeSearchResponseSchema.safeParse(responseWithTypes);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recipes.recipe?.[0]?.recipe_types?.recipe_type).toHaveLength(2);
    }
  });

  it("should normalize single ingredient to array", () => {
    const responseWithSingleIngredient = {
      recipes: {
        recipe: [
          {
            recipe_id: "123",
            recipe_name: "Simple Recipe",
            recipe_description: "One ingredient only",
            recipe_ingredients: {
              ingredient: "Salt",
            },
          },
        ],
        max_results: "20",
        page_number: "0",
        total_results: "1",
      },
    };

    const result = RecipeSearchResponseSchema.safeParse(responseWithSingleIngredient);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.recipes.recipe?.[0]?.recipe_ingredients?.ingredient)).toBe(true);
    }
  });
});

describe("RecipeDetailResponseSchema", () => {
  it("should validate valid recipe detail response", () => {
    const validResponse = {
      recipe: {
        recipe_id: "12345",
        recipe_name: "Grilled Chicken",
        recipe_description: "Delicious grilled chicken",
        ingredients: {
          ingredient: [
            {
              food_id: "1",
              food_name: "Chicken breast",
              number_of_units: "2",
            },
          ],
        },
      },
    };

    const result = RecipeDetailResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should validate recipe without ingredients", () => {
    const responseWithoutIngredients = {
      recipe: {
        recipe_id: "12345",
        recipe_name: "Simple Recipe",
        recipe_description: "No ingredients listed",
      },
    };

    const result = RecipeDetailResponseSchema.safeParse(responseWithoutIngredients);
    expect(result.success).toBe(true);
  });
});
