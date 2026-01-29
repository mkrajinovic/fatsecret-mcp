import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchFoods, getFood } from "../../methods/foods.js";
import type { FatSecretConfig } from "../../types.js";
import type { FoodSearchResponseParsed, FoodDetailResponseParsed } from "../../schemas.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

describe("searchFoods", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;
  const testConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should search for foods with default options", async () => {
    const mockResponse: FoodSearchResponseParsed = {
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
        total_results: "1",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await searchFoods(testConfig, "apple");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "foods.search",
        search_expression: "apple",
        page_number: "0",
        max_results: "20",
      },
      testConfig,
      false,
      expect.anything() // schema
    );
    expect(result).toEqual(mockResponse);
  });

  it("should search with custom pagination options", async () => {
    const mockResponse: FoodSearchResponseParsed = {
      foods: {
        food: [],
        max_results: "50",
        page_number: "2",
        total_results: "0",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    await searchFoods(testConfig, "banana", { pageNumber: 2, maxResults: 50 });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "foods.search",
        search_expression: "banana",
        page_number: "2",
        max_results: "50",
      },
      testConfig,
      false,
      expect.anything()
    );
  });

  it("should use useAccessToken=false for public search", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [], max_results: "20", page_number: "0", total_results: "0" } });

    await searchFoods(testConfig, "test");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      testConfig,
      false,
      expect.anything()
    );
  });

  it("should pass search expression correctly", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [], max_results: "20", page_number: "0", total_results: "0" } });

    await searchFoods(testConfig, "chicken breast");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        search_expression: "chicken breast",
      }),
      testConfig,
      false,
      expect.anything()
    );
  });

  it("should convert page number from options to string", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [], max_results: "20", page_number: "5", total_results: "0" } });

    await searchFoods(testConfig, "test", { pageNumber: 5 });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        page_number: "5",
      }),
      testConfig,
      false,
      expect.anything()
    );
  });

  it("should convert max results from options to string", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [], max_results: "50", page_number: "0", total_results: "0" } });

    await searchFoods(testConfig, "test", { maxResults: 50 });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        max_results: "50",
      }),
      testConfig,
      false,
      expect.anything()
    );
  });

  it("should include optional flags when provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [], max_results: "20", page_number: "0", total_results: "0" } });

    await searchFoods(testConfig, "test", {
      includeSubCategories: true,
      includeFoodImages: true,
      includeFoodAttributes: true,
      flagDefaultServing: true,
    });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        include_sub_categories: "true",
        include_food_images: "true",
        include_food_attributes: "true",
        flag_default_serving: "true",
      }),
      testConfig,
      false,
      expect.anything()
    );
  });

  it("should include region and language when provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [], max_results: "20", page_number: "0", total_results: "0" } });

    await searchFoods(testConfig, "test", { region: "US", language: "en" });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        region: "US",
        language: "en",
      }),
      testConfig,
      false,
      expect.anything()
    );
  });
});

describe("getFood", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;
  const testConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should get food details by ID", async () => {
    const mockResponse: FoodDetailResponseParsed = {
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

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFood(testConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "food.get",
        food_id: "12345",
      },
      testConfig,
      false,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when food ID is empty", async () => {
    await expect(getFood(testConfig, "")).rejects.toThrow("Food ID is required");
  });

  it("should use useAccessToken=false for public food details", async () => {
    mockMakeApiRequest.mockResolvedValue({ food: { food_id: "123", food_name: "Test", food_type: "Generic", servings: { serving: [] } } });

    await getFood(testConfig, "123");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      testConfig,
      false,
      expect.anything()
    );
  });

  it("should handle food with multiple servings", async () => {
    const mockResponse: FoodDetailResponseParsed = {
      food: {
        food_id: "123",
        food_name: "Rice",
        food_type: "Generic",
        servings: {
          serving: [
            {
              serving_id: "1",
              serving_description: "1 cup",
              calories: "200",
              fat: "0.4",
              carbohydrate: "45",
              protein: "4",
            },
            {
              serving_id: "2",
              serving_description: "100g",
              calories: "130",
              fat: "0.3",
              carbohydrate: "28",
              protein: "2.7",
            },
          ],
        },
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFood(testConfig, "123");

    expect(Array.isArray(result.food.servings.serving)).toBe(true);
  });

  it("should not make API call when food ID is missing", async () => {
    try {
      await getFood(testConfig, "");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should include optional flags when provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ food: { food_id: "123", food_name: "Test", food_type: "Generic", servings: { serving: [] } } });

    await getFood(testConfig, "123", {
      includeSubCategories: true,
      includeFoodImages: true,
      includeFoodAttributes: true,
      flagDefaultServing: true,
    });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        method: "food.get",
        food_id: "123",
        include_sub_categories: "true",
        include_food_images: "true",
        include_food_attributes: "true",
        flag_default_serving: "true",
      }),
      testConfig,
      false,
      expect.anything()
    );
  });

  it("should include region and language when provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ food: { food_id: "123", food_name: "Test", food_type: "Generic", servings: { serving: [] } } });

    await getFood(testConfig, "123", { region: "US", language: "en" });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        method: "food.get",
        food_id: "123",
        region: "US",
        language: "en",
      }),
      testConfig,
      false,
      expect.anything()
    );
  });
});

// NOTE: autocompleteFood and findFoodByBarcode tests removed - require OAuth 2.0
