import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSavedMeals,
  createSavedMeal,
  editSavedMeal,
  deleteSavedMeal,
  getSavedMealItems,
  addSavedMealItem,
  editSavedMealItem,
  deleteSavedMealItem,
} from "../../methods/saved_meals.js";
import type {
  FatSecretConfig,
  CreateSavedMealParams,
  EditSavedMealParams,
  AddSavedMealItemParams,
  EditSavedMealItemParams,
} from "../../types.js";
import type {
  SavedMealsResponseParsed,
  SavedMealCreateResponseParsed,
  SavedMealSuccessResponseParsed,
  SavedMealItemsResponseParsed,
  SavedMealItemAddResponseParsed,
} from "../../schemas/index.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

describe("getSavedMeals", () => {
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

  it("should get all saved meals", async () => {
    const mockResponse: SavedMealsResponseParsed = {
      saved_meals: {
        saved_meal: [
          {
            saved_meal_id: "123",
            saved_meal_name: "Breakfast Bowl",
            saved_meal_description: "Healthy morning meal",
            meals: "breakfast",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getSavedMeals(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "saved_meals.get",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get saved meals filtered by meal type", async () => {
    const mockResponse: SavedMealsResponseParsed = {
      saved_meals: {
        saved_meal: [
          {
            saved_meal_id: "456",
            saved_meal_name: "Lunch Plate",
            meals: "lunch",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getSavedMeals(authenticatedConfig, "lunch");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "saved_meals.get",
        meal: "lunch",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(getSavedMeals(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getSavedMeals(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle empty saved meals", async () => {
    const mockResponse: SavedMealsResponseParsed = {
      saved_meals: {
        saved_meal: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getSavedMeals(authenticatedConfig);

    expect(result.saved_meals.saved_meal).toEqual([]);
  });

  it("should handle different meal types", async () => {
    const mealTypes = ["breakfast", "lunch", "dinner", "other"] as const;

    for (const meal of mealTypes) {
      vi.clearAllMocks();
      mockMakeApiRequest.mockResolvedValue({ saved_meals: { saved_meal: [] } });

      await getSavedMeals(authenticatedConfig, meal);

      expect(mockMakeApiRequest).toHaveBeenCalledWith(
        "GET",
        expect.objectContaining({ meal }),
        authenticatedConfig,
        true,
        expect.anything()
      );
    }
  });
});

describe("createSavedMeal", () => {
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

  const validParams: CreateSavedMealParams = {
    name: "My Breakfast",
    description: "Healthy morning meal",
    meals: "breakfast",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should create saved meal with all params", async () => {
    const mockResponse: SavedMealCreateResponseParsed = {
      saved_meal_id: {
        value: "12345",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await createSavedMeal(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal.create",
        saved_meal_name: "My Breakfast",
        saved_meal_description: "Healthy morning meal",
        meals: "breakfast",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should create saved meal with only name", async () => {
    const minimalParams: CreateSavedMealParams = {
      name: "Simple Meal",
    };

    mockMakeApiRequest.mockResolvedValue({ saved_meal_id: { value: "123" } });

    await createSavedMeal(authenticatedConfig, minimalParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal.create",
        saved_meal_name: "Simple Meal",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(createSavedMeal(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when name is empty", async () => {
    const invalidParams: CreateSavedMealParams = {
      name: "",
    };

    await expect(createSavedMeal(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Saved meal name is required"
    );
  });

  it("should throw error when name is only whitespace", async () => {
    const invalidParams: CreateSavedMealParams = {
      name: "   ",
    };

    await expect(createSavedMeal(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Saved meal name is required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await createSavedMeal(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when name is empty", async () => {
    try {
      await createSavedMeal(authenticatedConfig, { name: "" });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ saved_meal_id: { value: "123" } });

    await createSavedMeal(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("editSavedMeal", () => {
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

  const validParams: EditSavedMealParams = {
    savedMealId: "12345",
    name: "Updated Breakfast",
    description: "Updated description",
    meals: "breakfast,lunch",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should edit saved meal with all params", async () => {
    const mockResponse: SavedMealSuccessResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await editSavedMeal(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal.edit",
        saved_meal_id: "12345",
        saved_meal_name: "Updated Breakfast",
        saved_meal_description: "Updated description",
        meals: "breakfast,lunch",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should edit saved meal with only id", async () => {
    const minimalParams: EditSavedMealParams = {
      savedMealId: "12345",
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMeal(authenticatedConfig, minimalParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal.edit",
        saved_meal_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should edit saved meal with partial params", async () => {
    const partialParams: EditSavedMealParams = {
      savedMealId: "12345",
      name: "New Name",
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMeal(authenticatedConfig, partialParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal.edit",
        saved_meal_id: "12345",
        saved_meal_name: "New Name",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(editSavedMeal(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when savedMealId is empty", async () => {
    const invalidParams: EditSavedMealParams = {
      savedMealId: "",
      name: "Some Name",
    };

    await expect(editSavedMeal(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Saved meal ID is required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await editSavedMeal(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when savedMealId is empty", async () => {
    try {
      await editSavedMeal(authenticatedConfig, { savedMealId: "" });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMeal(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should only include provided optional params", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMeal(authenticatedConfig, { savedMealId: "123", description: "New desc" });

    const callArgs = mockMakeApiRequest.mock.calls[0][1];
    expect(callArgs).toEqual({
      method: "saved_meal.edit",
      saved_meal_id: "123",
      saved_meal_description: "New desc",
    });
    expect(callArgs).not.toHaveProperty("saved_meal_name");
    expect(callArgs).not.toHaveProperty("meals");
  });
});

describe("deleteSavedMeal", () => {
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

  it("should delete saved meal with valid id", async () => {
    const mockResponse: SavedMealSuccessResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await deleteSavedMeal(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal.delete",
        saved_meal_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(deleteSavedMeal(unauthenticatedConfig, "12345")).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when savedMealId is empty", async () => {
    await expect(deleteSavedMeal(authenticatedConfig, "")).rejects.toThrow(
      "Saved meal ID is required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await deleteSavedMeal(unauthenticatedConfig, "12345");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when savedMealId is empty", async () => {
    try {
      await deleteSavedMeal(authenticatedConfig, "");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteSavedMeal(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("getSavedMealItems", () => {
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

  it("should get saved meal items", async () => {
    const mockResponse: SavedMealItemsResponseParsed = {
      saved_meal_items: {
        saved_meal_item: [
          {
            saved_meal_item_id: "111",
            food_id: "222",
            saved_meal_item_name: "Oatmeal",
            serving_id: "1",
            number_of_units: "1",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getSavedMealItems(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "saved_meal_items.get",
        saved_meal_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(getSavedMealItems(unauthenticatedConfig, "12345")).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when savedMealId is empty", async () => {
    await expect(getSavedMealItems(authenticatedConfig, "")).rejects.toThrow(
      "Saved meal ID is required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getSavedMealItems(unauthenticatedConfig, "12345");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when savedMealId is empty", async () => {
    try {
      await getSavedMealItems(authenticatedConfig, "");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle empty saved meal items", async () => {
    const mockResponse: SavedMealItemsResponseParsed = {
      saved_meal_items: {
        saved_meal_item: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getSavedMealItems(authenticatedConfig, "12345");

    expect(result.saved_meal_items.saved_meal_item).toEqual([]);
  });

  it("should use GET method", async () => {
    mockMakeApiRequest.mockResolvedValue({ saved_meal_items: { saved_meal_item: [] } });

    await getSavedMealItems(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("addSavedMealItem", () => {
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

  const validParams: AddSavedMealItemParams = {
    savedMealId: "12345",
    foodId: "67890",
    itemName: "Apple",
    servingId: "1",
    quantity: 2,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should add saved meal item with valid params", async () => {
    const mockResponse: SavedMealItemAddResponseParsed = {
      saved_meal_item_id: {
        value: "99999",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await addSavedMealItem(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal_item.add",
        saved_meal_id: "12345",
        food_id: "67890",
        saved_meal_item_name: "Apple",
        serving_id: "1",
        number_of_units: "2",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(addSavedMealItem(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when savedMealId is empty", async () => {
    const invalidParams: AddSavedMealItemParams = {
      ...validParams,
      savedMealId: "",
    };

    await expect(addSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Saved meal ID is required"
    );
  });

  it("should throw error when foodId is empty", async () => {
    const invalidParams: AddSavedMealItemParams = {
      ...validParams,
      foodId: "",
    };

    await expect(addSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Food ID is required"
    );
  });

  it("should throw error when itemName is empty", async () => {
    const invalidParams: AddSavedMealItemParams = {
      ...validParams,
      itemName: "",
    };

    await expect(addSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Item name is required"
    );
  });

  it("should throw error when itemName is only whitespace", async () => {
    const invalidParams: AddSavedMealItemParams = {
      ...validParams,
      itemName: "   ",
    };

    await expect(addSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Item name is required"
    );
  });

  it("should throw error when servingId is empty", async () => {
    const invalidParams: AddSavedMealItemParams = {
      ...validParams,
      servingId: "",
    };

    await expect(addSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Serving ID is required"
    );
  });

  it("should throw error when quantity is zero", async () => {
    const invalidParams: AddSavedMealItemParams = {
      ...validParams,
      quantity: 0,
    };

    await expect(addSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should throw error when quantity is negative", async () => {
    const invalidParams: AddSavedMealItemParams = {
      ...validParams,
      quantity: -1,
    };

    await expect(addSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await addSavedMealItem(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when savedMealId is empty", async () => {
    try {
      await addSavedMealItem(authenticatedConfig, { ...validParams, savedMealId: "" });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when quantity is invalid", async () => {
    try {
      await addSavedMealItem(authenticatedConfig, { ...validParams, quantity: 0 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ saved_meal_item_id: { value: "123" } });

    await addSavedMealItem(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should convert quantity to string", async () => {
    const paramsWithFloat: AddSavedMealItemParams = {
      ...validParams,
      quantity: 1.5,
    };

    mockMakeApiRequest.mockResolvedValue({ saved_meal_item_id: { value: "123" } });

    await addSavedMealItem(authenticatedConfig, paramsWithFloat);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        number_of_units: "1.5",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("editSavedMealItem", () => {
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

  const validParams: EditSavedMealItemParams = {
    savedMealItemId: "12345",
    itemName: "Updated Apple",
    quantity: 3,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should edit saved meal item with all params", async () => {
    const mockResponse: SavedMealSuccessResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await editSavedMealItem(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal_item.edit",
        saved_meal_item_id: "12345",
        saved_meal_item_name: "Updated Apple",
        number_of_units: "3",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should edit saved meal item with only id", async () => {
    const minimalParams: EditSavedMealItemParams = {
      savedMealItemId: "12345",
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMealItem(authenticatedConfig, minimalParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal_item.edit",
        saved_meal_item_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should edit saved meal item with partial params", async () => {
    const partialParams: EditSavedMealItemParams = {
      savedMealItemId: "12345",
      quantity: 5,
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMealItem(authenticatedConfig, partialParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal_item.edit",
        saved_meal_item_id: "12345",
        number_of_units: "5",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(editSavedMealItem(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when savedMealItemId is empty", async () => {
    const invalidParams: EditSavedMealItemParams = {
      savedMealItemId: "",
      itemName: "Some Name",
    };

    await expect(editSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Saved meal item ID is required"
    );
  });

  it("should throw error when quantity is zero", async () => {
    const invalidParams: EditSavedMealItemParams = {
      savedMealItemId: "12345",
      quantity: 0,
    };

    await expect(editSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should throw error when quantity is negative", async () => {
    const invalidParams: EditSavedMealItemParams = {
      savedMealItemId: "12345",
      quantity: -1,
    };

    await expect(editSavedMealItem(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await editSavedMealItem(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when savedMealItemId is empty", async () => {
    try {
      await editSavedMealItem(authenticatedConfig, { savedMealItemId: "" });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when quantity is invalid", async () => {
    try {
      await editSavedMealItem(authenticatedConfig, { savedMealItemId: "123", quantity: 0 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMealItem(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should convert quantity to string", async () => {
    const paramsWithFloat: EditSavedMealItemParams = {
      savedMealItemId: "12345",
      quantity: 1.5,
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMealItem(authenticatedConfig, paramsWithFloat);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        number_of_units: "1.5",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should only include provided optional params", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editSavedMealItem(authenticatedConfig, { savedMealItemId: "123", itemName: "New Name" });

    const callArgs = mockMakeApiRequest.mock.calls[0][1];
    expect(callArgs).toEqual({
      method: "saved_meal_item.edit",
      saved_meal_item_id: "123",
      saved_meal_item_name: "New Name",
    });
    expect(callArgs).not.toHaveProperty("number_of_units");
  });
});

describe("deleteSavedMealItem", () => {
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

  it("should delete saved meal item with valid id", async () => {
    const mockResponse: SavedMealSuccessResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await deleteSavedMealItem(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "saved_meal_item.delete",
        saved_meal_item_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(deleteSavedMealItem(unauthenticatedConfig, "12345")).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when savedMealItemId is empty", async () => {
    await expect(deleteSavedMealItem(authenticatedConfig, "")).rejects.toThrow(
      "Saved meal item ID is required"
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await deleteSavedMealItem(unauthenticatedConfig, "12345");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when savedMealItemId is empty", async () => {
    try {
      await deleteSavedMealItem(authenticatedConfig, "");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteSavedMealItem(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});
