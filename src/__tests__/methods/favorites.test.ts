import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addFoodFavorite,
  deleteFoodFavorite,
  getFavoriteFoods,
  getMostEatenFoods,
  getRecentlyEatenFoods,
  addRecipeFavorite,
  deleteRecipeFavorite,
  getFavoriteRecipes,
} from "../../methods/favorites.js";
import type {
  FatSecretConfig,
  AddFoodFavoriteParams,
  DeleteFoodFavoriteParams,
} from "../../types.js";
import type {
  FavoriteFoodsResponseParsed,
  FavoriteRecipesResponseParsed,
  FavoriteSuccessResponseParsed,
} from "../../schemas/index.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

describe("addFoodFavorite", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  const validParams: AddFoodFavoriteParams = {
    foodId: "12345",
    servingId: "67890",
    quantity: 2,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should add food favorite with all params", async () => {
    const mockResponse: FavoriteSuccessResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await addFoodFavorite(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food.add_favorite",
        food_id: "12345",
        serving_id: "67890",
        number_of_units: "2",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should add food favorite with only foodId", async () => {
    const minimalParams: AddFoodFavoriteParams = {
      foodId: "12345",
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await addFoodFavorite(authenticatedConfig, minimalParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food.add_favorite",
        food_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should add food favorite with optional servingId", async () => {
    const paramsWithServing: AddFoodFavoriteParams = {
      foodId: "12345",
      servingId: "67890",
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await addFoodFavorite(authenticatedConfig, paramsWithServing);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food.add_favorite",
        food_id: "12345",
        serving_id: "67890",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should add food favorite with optional quantity", async () => {
    const paramsWithQuantity: AddFoodFavoriteParams = {
      foodId: "12345",
      quantity: 1.5,
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await addFoodFavorite(authenticatedConfig, paramsWithQuantity);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food.add_favorite",
        food_id: "12345",
        number_of_units: "1.5",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(addFoodFavorite(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when foodId is empty", async () => {
    const invalidParams: AddFoodFavoriteParams = {
      foodId: "",
    };

    await expect(addFoodFavorite(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Food ID is required"
    );
  });

  it("should throw error when quantity is zero", async () => {
    const invalidParams: AddFoodFavoriteParams = {
      foodId: "12345",
      quantity: 0,
    };

    await expect(addFoodFavorite(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should throw error when quantity is negative", async () => {
    const invalidParams: AddFoodFavoriteParams = {
      foodId: "12345",
      quantity: -1,
    };

    await expect(addFoodFavorite(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await addFoodFavorite(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when foodId is empty", async () => {
    try {
      await addFoodFavorite(authenticatedConfig, { foodId: "" });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when quantity is invalid", async () => {
    try {
      await addFoodFavorite(authenticatedConfig, { foodId: "123", quantity: 0 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await addFoodFavorite(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should convert quantity to string", async () => {
    const paramsWithFloat: AddFoodFavoriteParams = {
      foodId: "12345",
      quantity: 2.5,
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await addFoodFavorite(authenticatedConfig, paramsWithFloat);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        number_of_units: "2.5",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("deleteFoodFavorite", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  const validParams: DeleteFoodFavoriteParams = {
    foodId: "12345",
    servingId: "67890",
    quantity: 2,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should delete food favorite with all params", async () => {
    const mockResponse: FavoriteSuccessResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await deleteFoodFavorite(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food.delete_favorite",
        food_id: "12345",
        serving_id: "67890",
        number_of_units: "2",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should delete food favorite with only foodId", async () => {
    const minimalParams: DeleteFoodFavoriteParams = {
      foodId: "12345",
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteFoodFavorite(authenticatedConfig, minimalParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food.delete_favorite",
        food_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should delete food favorite with optional servingId", async () => {
    const paramsWithServing: DeleteFoodFavoriteParams = {
      foodId: "12345",
      servingId: "67890",
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteFoodFavorite(authenticatedConfig, paramsWithServing);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food.delete_favorite",
        food_id: "12345",
        serving_id: "67890",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should delete food favorite with optional quantity", async () => {
    const paramsWithQuantity: DeleteFoodFavoriteParams = {
      foodId: "12345",
      quantity: 1.5,
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteFoodFavorite(authenticatedConfig, paramsWithQuantity);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food.delete_favorite",
        food_id: "12345",
        number_of_units: "1.5",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(deleteFoodFavorite(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when foodId is empty", async () => {
    const invalidParams: DeleteFoodFavoriteParams = {
      foodId: "",
    };

    await expect(deleteFoodFavorite(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Food ID is required"
    );
  });

  it("should throw error when quantity is zero", async () => {
    const invalidParams: DeleteFoodFavoriteParams = {
      foodId: "12345",
      quantity: 0,
    };

    await expect(deleteFoodFavorite(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should throw error when quantity is negative", async () => {
    const invalidParams: DeleteFoodFavoriteParams = {
      foodId: "12345",
      quantity: -1,
    };

    await expect(deleteFoodFavorite(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await deleteFoodFavorite(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when foodId is empty", async () => {
    try {
      await deleteFoodFavorite(authenticatedConfig, { foodId: "" });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when quantity is invalid", async () => {
    try {
      await deleteFoodFavorite(authenticatedConfig, { foodId: "123", quantity: 0 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteFoodFavorite(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("getFavoriteFoods", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should get all favorite foods", async () => {
    const mockResponse: FavoriteFoodsResponseParsed = {
      foods: {
        food: [
          {
            food_id: "123",
            food_name: "Apple",
            food_type: "Generic",
            food_url: "https://example.com/apple",
            serving_id: "1",
            number_of_units: "1",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFavoriteFoods(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "foods.get_favorites",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(getFavoriteFoods(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getFavoriteFoods(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle empty favorite foods", async () => {
    const mockResponse: FavoriteFoodsResponseParsed = {
      foods: {
        food: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFavoriteFoods(authenticatedConfig);

    expect(result.foods.food).toEqual([]);
  });

  it("should use GET method", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [] } });

    await getFavoriteFoods(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("getMostEatenFoods", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should get most eaten foods without meal filter", async () => {
    const mockResponse: FavoriteFoodsResponseParsed = {
      foods: {
        food: [
          {
            food_id: "123",
            food_name: "Oatmeal",
            food_type: "Generic",
            food_url: "https://example.com/oatmeal",
            serving_id: "1",
            number_of_units: "1",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getMostEatenFoods(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "foods.get_most_eaten",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get most eaten foods with meal filter", async () => {
    const mockResponse: FavoriteFoodsResponseParsed = {
      foods: {
        food: [
          {
            food_id: "456",
            food_name: "Salad",
            food_type: "Generic",
            food_url: "https://example.com/salad",
            serving_id: "1",
            number_of_units: "1",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getMostEatenFoods(authenticatedConfig, "lunch");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "foods.get_most_eaten",
        meal: "lunch",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(getMostEatenFoods(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getMostEatenFoods(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle empty most eaten foods", async () => {
    const mockResponse: FavoriteFoodsResponseParsed = {
      foods: {
        food: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getMostEatenFoods(authenticatedConfig);

    expect(result.foods.food).toEqual([]);
  });

  it("should handle different meal types", async () => {
    const mealTypes = ["breakfast", "lunch", "dinner", "other"] as const;

    for (const meal of mealTypes) {
      vi.clearAllMocks();
      mockMakeApiRequest.mockResolvedValue({ foods: { food: [] } });

      await getMostEatenFoods(authenticatedConfig, meal);

      expect(mockMakeApiRequest).toHaveBeenCalledWith(
        "GET",
        expect.objectContaining({ meal }),
        authenticatedConfig,
        true,
        expect.anything()
      );
    }
  });

  it("should use GET method", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [] } });

    await getMostEatenFoods(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("getRecentlyEatenFoods", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should get recently eaten foods without meal filter", async () => {
    const mockResponse: FavoriteFoodsResponseParsed = {
      foods: {
        food: [
          {
            food_id: "123",
            food_name: "Sandwich",
            food_type: "Generic",
            food_url: "https://example.com/sandwich",
            serving_id: "1",
            number_of_units: "1",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getRecentlyEatenFoods(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "foods.get_recently_eaten",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get recently eaten foods with meal filter", async () => {
    const mockResponse: FavoriteFoodsResponseParsed = {
      foods: {
        food: [
          {
            food_id: "789",
            food_name: "Steak",
            food_type: "Generic",
            food_url: "https://example.com/steak",
            serving_id: "1",
            number_of_units: "1",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getRecentlyEatenFoods(authenticatedConfig, "dinner");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "foods.get_recently_eaten",
        meal: "dinner",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(getRecentlyEatenFoods(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getRecentlyEatenFoods(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle empty recently eaten foods", async () => {
    const mockResponse: FavoriteFoodsResponseParsed = {
      foods: {
        food: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getRecentlyEatenFoods(authenticatedConfig);

    expect(result.foods.food).toEqual([]);
  });

  it("should handle different meal types", async () => {
    const mealTypes = ["breakfast", "lunch", "dinner", "other"] as const;

    for (const meal of mealTypes) {
      vi.clearAllMocks();
      mockMakeApiRequest.mockResolvedValue({ foods: { food: [] } });

      await getRecentlyEatenFoods(authenticatedConfig, meal);

      expect(mockMakeApiRequest).toHaveBeenCalledWith(
        "GET",
        expect.objectContaining({ meal }),
        authenticatedConfig,
        true,
        expect.anything()
      );
    }
  });

  it("should use GET method", async () => {
    mockMakeApiRequest.mockResolvedValue({ foods: { food: [] } });

    await getRecentlyEatenFoods(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("addRecipeFavorite", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should add recipe favorite with valid recipeId", async () => {
    const mockResponse: FavoriteSuccessResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await addRecipeFavorite(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "recipe.add_favorite",
        recipe_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(addRecipeFavorite(unauthenticatedConfig, "12345")).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when recipeId is empty", async () => {
    await expect(addRecipeFavorite(authenticatedConfig, "")).rejects.toThrow(
      "Recipe ID is required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await addRecipeFavorite(unauthenticatedConfig, "12345");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when recipeId is empty", async () => {
    try {
      await addRecipeFavorite(authenticatedConfig, "");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await addRecipeFavorite(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("deleteRecipeFavorite", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should delete recipe favorite with valid recipeId", async () => {
    const mockResponse: FavoriteSuccessResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await deleteRecipeFavorite(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "recipe.delete_favorite",
        recipe_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(deleteRecipeFavorite(unauthenticatedConfig, "12345")).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when recipeId is empty", async () => {
    await expect(deleteRecipeFavorite(authenticatedConfig, "")).rejects.toThrow(
      "Recipe ID is required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await deleteRecipeFavorite(unauthenticatedConfig, "12345");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when recipeId is empty", async () => {
    try {
      await deleteRecipeFavorite(authenticatedConfig, "");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteRecipeFavorite(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("getFavoriteRecipes", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should get all favorite recipes", async () => {
    const mockResponse: FavoriteRecipesResponseParsed = {
      recipes: {
        recipe: [
          {
            recipe_id: "123",
            recipe_name: "Healthy Breakfast Bowl",
            recipe_url: "https://example.com/recipe/123",
            recipe_description: "A nutritious breakfast bowl",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFavoriteRecipes(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "recipes.get_favorites",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(getFavoriteRecipes(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getFavoriteRecipes(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle empty favorite recipes", async () => {
    const mockResponse: FavoriteRecipesResponseParsed = {
      recipes: {
        recipe: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFavoriteRecipes(authenticatedConfig);

    expect(result.recipes.recipe).toEqual([]);
  });

  it("should use GET method", async () => {
    mockMakeApiRequest.mockResolvedValue({ recipes: { recipe: [] } });

    await getFavoriteRecipes(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should handle recipes with images", async () => {
    const mockResponse: FavoriteRecipesResponseParsed = {
      recipes: {
        recipe: [
          {
            recipe_id: "456",
            recipe_name: "Grilled Chicken",
            recipe_url: "https://example.com/recipe/456",
            recipe_description: "Delicious grilled chicken",
            recipe_image: "https://example.com/images/grilled-chicken.jpg",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFavoriteRecipes(authenticatedConfig);

    expect(result.recipes.recipe[0].recipe_image).toBe(
      "https://example.com/images/grilled-chicken.jpg"
    );
  });
});
