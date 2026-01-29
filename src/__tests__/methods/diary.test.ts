import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getFoodEntries,
  createFoodEntry,
  editFoodEntry,
  deleteFoodEntry,
  getFoodEntriesMonth,
} from "../../methods/diary.js";
import type { FatSecretConfig, CreateFoodEntryParams, EditFoodEntryParams } from "../../types.js";
import type {
  FoodEntriesResponseParsed,
  FoodEntryCreateResponseParsed,
  FoodEntryEditResponseParsed,
  FoodEntryDeleteResponseParsed,
  FoodEntriesMonthResponseParsed,
} from "../../schemas.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

// Mock the date utility
vi.mock("../../utils/date.js", () => ({
  dateToFatSecretFormat: vi.fn((date?: string) => {
    if (date === "2024-01-15") return "19737";
    if (date === "2024-01-01") return "19723";
    return "19737"; // default for undefined (today)
  }),
}));

describe("getFoodEntries", () => {
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

  it("should get food entries for a specific date", async () => {
    const mockResponse: FoodEntriesResponseParsed = {
      food_entries: {
        food_entry: [
          {
            food_entry_id: "123",
            food_id: "456",
            food_entry_name: "Apple",
            serving_id: "1",
            number_of_units: "1",
            meal: "breakfast",
            date_int: "19737",
            calories: "95",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntries(authenticatedConfig, "2024-01-15");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "food_entries.get",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get food entries for today when no date provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ food_entries: { food_entry: [] } });

    await getFoodEntries(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "food_entries.get",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(getFoodEntries(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ food_entries: { food_entry: [] } });

    await getFoodEntries(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should handle empty food entries", async () => {
    const mockResponse: FoodEntriesResponseParsed = {
      food_entries: {
        food_entry: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntries(authenticatedConfig);

    expect(result.food_entries.food_entry).toEqual([]);
  });

  it("should handle single food entry normalized to array", async () => {
    // Note: With schema validation, single entries are normalized to arrays
    const mockResponse: FoodEntriesResponseParsed = {
      food_entries: {
        food_entry: [
          {
            food_entry_id: "123",
            food_id: "456",
            food_entry_name: "Banana",
            serving_id: "1",
            number_of_units: "1",
            meal: "snack",
            date_int: "19737",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntries(authenticatedConfig);

    expect(result.food_entries.food_entry).toBeDefined();
    expect(Array.isArray(result.food_entries.food_entry)).toBe(true);
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getFoodEntries(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });
});

describe("createFoodEntry", () => {
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

  const validParams: CreateFoodEntryParams = {
    foodId: "12345",
    foodName: "Apple",
    servingId: "1",
    quantity: 1,
    mealType: "breakfast",
    date: "2024-01-15",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should create food entry with valid params", async () => {
    const mockResponse: FoodEntryCreateResponseParsed = {
      food_entry_id: {
        value: "98765",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await createFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food_entry.create",
        food_id: "12345",
        food_entry_name: "Apple",
        serving_id: "1",
        number_of_units: "1",
        meal: "breakfast",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should create food entry without date (use today)", async () => {
    const paramsWithoutDate: CreateFoodEntryParams = {
      foodId: "12345",
      foodName: "Banana",
      servingId: "2",
      quantity: 2,
      mealType: "snack",
    };

    mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "111" } });

    await createFoodEntry(authenticatedConfig, paramsWithoutDate);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        food_id: "12345",
        food_entry_name: "Banana",
        number_of_units: "2",
        meal: "snack",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(createFoodEntry(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when quantity is zero", async () => {
    const invalidParams: CreateFoodEntryParams = {
      ...validParams,
      quantity: 0,
    };

    await expect(createFoodEntry(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should throw error when quantity is negative", async () => {
    const invalidParams: CreateFoodEntryParams = {
      ...validParams,
      quantity: -1,
    };

    await expect(createFoodEntry(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "123" } });

    await createFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should convert quantity to string", async () => {
    const paramsWithFloat: CreateFoodEntryParams = {
      ...validParams,
      quantity: 1.5,
    };

    mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "123" } });

    await createFoodEntry(authenticatedConfig, paramsWithFloat);

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

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "123" } });

    await createFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await createFoodEntry(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when quantity is invalid", async () => {
    try {
      await createFoodEntry(authenticatedConfig, { ...validParams, quantity: 0 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle different meal types", async () => {
    const mealTypes = ["breakfast", "lunch", "dinner", "other"];

    for (const mealType of mealTypes) {
      vi.clearAllMocks();
      mockMakeApiRequest.mockResolvedValue({ food_entry_id: { value: "123" } });

      await createFoodEntry(authenticatedConfig, { ...validParams, mealType });

      expect(mockMakeApiRequest).toHaveBeenCalledWith(
        "POST",
        expect.objectContaining({ meal: mealType }),
        authenticatedConfig,
        true,
        expect.anything()
      );
    }
  });
});

describe("editFoodEntry", () => {
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

  const validParams: EditFoodEntryParams = {
    foodEntryId: "12345",
    foodName: "Updated Apple",
    servingId: "2",
    quantity: 2,
    mealType: "lunch",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should edit food entry with all params", async () => {
    const mockResponse: FoodEntryEditResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await editFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food_entry.edit",
        food_entry_id: "12345",
        food_entry_name: "Updated Apple",
        serving_id: "2",
        number_of_units: "2",
        meal: "lunch",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should edit food entry with only foodEntryId", async () => {
    const minimalParams: EditFoodEntryParams = {
      foodEntryId: "12345",
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editFoodEntry(authenticatedConfig, minimalParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food_entry.edit",
        food_entry_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should edit food entry with partial params", async () => {
    const partialParams: EditFoodEntryParams = {
      foodEntryId: "12345",
      quantity: 3,
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editFoodEntry(authenticatedConfig, partialParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food_entry.edit",
        food_entry_id: "12345",
        number_of_units: "3",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(editFoodEntry(unauthenticatedConfig, validParams)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when foodEntryId is missing", async () => {
    const paramsWithoutId = {
      foodEntryId: "",
      foodName: "Apple",
    } as EditFoodEntryParams;

    await expect(editFoodEntry(authenticatedConfig, paramsWithoutId)).rejects.toThrow(
      "Food entry ID is required"
    );
  });

  it("should throw error when quantity is zero", async () => {
    const invalidParams: EditFoodEntryParams = {
      foodEntryId: "12345",
      quantity: 0,
    };

    await expect(editFoodEntry(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should throw error when quantity is negative", async () => {
    const invalidParams: EditFoodEntryParams = {
      foodEntryId: "12345",
      quantity: -1,
    };

    await expect(editFoodEntry(authenticatedConfig, invalidParams)).rejects.toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should convert quantity to string", async () => {
    const paramsWithFloat: EditFoodEntryParams = {
      foodEntryId: "12345",
      quantity: 1.5,
    };

    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editFoodEntry(authenticatedConfig, paramsWithFloat);

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

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editFoodEntry(authenticatedConfig, validParams);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await editFoodEntry(unauthenticatedConfig, validParams);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when foodEntryId is missing", async () => {
    try {
      await editFoodEntry(authenticatedConfig, { foodEntryId: "" });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when quantity is invalid", async () => {
    try {
      await editFoodEntry(authenticatedConfig, { foodEntryId: "123", quantity: 0 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle different meal types", async () => {
    const mealTypes = ["breakfast", "lunch", "dinner", "other"];

    for (const mealType of mealTypes) {
      vi.clearAllMocks();
      mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

      await editFoodEntry(authenticatedConfig, { foodEntryId: "123", mealType });

      expect(mockMakeApiRequest).toHaveBeenCalledWith(
        "POST",
        expect.objectContaining({ meal: mealType }),
        authenticatedConfig,
        true,
        expect.anything()
      );
    }
  });

  it("should only include provided optional params", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await editFoodEntry(authenticatedConfig, { foodEntryId: "123", foodName: "Banana" });

    const callArgs = mockMakeApiRequest.mock.calls[0][1];
    expect(callArgs).toEqual({
      method: "food_entry.edit",
      food_entry_id: "123",
      food_entry_name: "Banana",
    });
    expect(callArgs).not.toHaveProperty("serving_id");
    expect(callArgs).not.toHaveProperty("number_of_units");
    expect(callArgs).not.toHaveProperty("meal");
  });
});

describe("deleteFoodEntry", () => {
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

  it("should delete food entry with valid id", async () => {
    const mockResponse: FoodEntryDeleteResponseParsed = {
      success: {
        value: "true",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await deleteFoodEntry(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "food_entry.delete",
        food_entry_id: "12345",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(deleteFoodEntry(unauthenticatedConfig, "12345")).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when foodEntryId is empty string", async () => {
    await expect(deleteFoodEntry(authenticatedConfig, "")).rejects.toThrow(
      "Food entry ID is required"
    );
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteFoodEntry(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteFoodEntry(authenticatedConfig, "12345");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await deleteFoodEntry(unauthenticatedConfig, "12345");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when foodEntryId is empty", async () => {
    try {
      await deleteFoodEntry(authenticatedConfig, "");
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should pass the food_entry.delete method to API", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "true" } });

    await deleteFoodEntry(authenticatedConfig, "98765");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        method: "food_entry.delete",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});

describe("getFoodEntriesMonth", () => {
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

  it("should get food entries for a specific month", async () => {
    const mockResponse: FoodEntriesMonthResponseParsed = {
      month: {
        from_date_int: "19723",
        to_date_int: "19753",
        day: [
          {
            date_int: "19737",
            calories: "2000",
            carbohydrate: "250",
            protein: "80",
            fat: "70",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntriesMonth(authenticatedConfig, "2024-01-15");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "food_entries.get_month",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get food entries for today when no date provided", async () => {
    mockMakeApiRequest.mockResolvedValue({
      month: { from_date_int: "19723", to_date_int: "19753", day: [] },
    });

    await getFoodEntriesMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "food_entries.get_month",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(getFoodEntriesMonth(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should use GET method", async () => {
    mockMakeApiRequest.mockResolvedValue({
      month: { from_date_int: "19723", to_date_int: "19753", day: [] },
    });

    await getFoodEntriesMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({
      month: { from_date_int: "19723", to_date_int: "19753", day: [] },
    });

    await getFoodEntriesMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getFoodEntriesMonth(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle empty day array", async () => {
    const mockResponse: FoodEntriesMonthResponseParsed = {
      month: {
        from_date_int: "19723",
        to_date_int: "19753",
        day: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntriesMonth(authenticatedConfig);

    expect(result.month.day).toEqual([]);
  });

  it("should handle multiple days in response", async () => {
    const mockResponse: FoodEntriesMonthResponseParsed = {
      month: {
        from_date_int: "19723",
        to_date_int: "19753",
        day: [
          {
            date_int: "19737",
            calories: "2000",
          },
          {
            date_int: "19738",
            calories: "1800",
          },
          {
            date_int: "19739",
            calories: "2200",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntriesMonth(authenticatedConfig);

    expect(result.month.day).toHaveLength(3);
  });

  it("should handle day entries with partial nutritional data", async () => {
    const mockResponse: FoodEntriesMonthResponseParsed = {
      month: {
        from_date_int: "19723",
        to_date_int: "19753",
        day: [
          {
            date_int: "19737",
            calories: "2000",
            // protein, carbohydrate, fat are optional
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getFoodEntriesMonth(authenticatedConfig);

    expect(result.month.day[0]).toEqual({
      date_int: "19737",
      calories: "2000",
    });
  });

  it("should pass the food_entries.get_month method to API", async () => {
    mockMakeApiRequest.mockResolvedValue({
      month: { from_date_int: "19723", to_date_int: "19753", day: [] },
    });

    await getFoodEntriesMonth(authenticatedConfig, "2024-01-01");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        method: "food_entries.get_month",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});
