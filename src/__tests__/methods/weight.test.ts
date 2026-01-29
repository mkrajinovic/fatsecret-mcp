import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWeightMonth, updateWeight } from "../../methods/weight.js";
import type { FatSecretConfig } from "../../types.js";
import type { WeightMonthResponseParsed, WeightUpdateResponseParsed } from "../../schemas.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

// Mock the date utility
vi.mock("../../utils/date.js", () => ({
  dateToFatSecretFormat: vi.fn((date?: string) => {
    if (date === "2024-01-15") return "19737";
    if (date === "2024-02-01") return "19754";
    return "19737"; // default for undefined (today)
  }),
}));

describe("getWeightMonth", () => {
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

  it("should get weight entries for a specific month", async () => {
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_kg: "75.5",
            weight_lbs: "166.4",
          },
          {
            date_int: "19738",
            weight_kg: "75.3",
            weight_lbs: "166.0",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig, "2024-01-15");

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "weights.get_month",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get weight entries for current month when no date provided", async () => {
    mockMakeApiRequest.mockResolvedValue({ month: { day: [] } });

    await getWeightMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      {
        method: "weights.get_month",
        date: "19737",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should throw error when access token is missing", async () => {
    await expect(getWeightMonth(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when access token secret is missing", async () => {
    const configWithoutSecret: FatSecretConfig = {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      accessToken: "test_access_token",
    };

    await expect(getWeightMonth(configWithoutSecret)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ month: { day: [] } });

    await getWeightMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should use GET method", async () => {
    mockMakeApiRequest.mockResolvedValue({ month: { day: [] } });

    await getWeightMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should handle empty weight data", async () => {
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig);

    expect(result.month.day).toEqual([]);
  });

  it("should handle single day weight entry normalized to array", async () => {
    // Note: With schema validation, single entries are normalized to arrays
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_kg: "80.0",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig);

    expect(result.month.day).toBeDefined();
    expect(Array.isArray(result.month.day)).toBe(true);
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getWeightMonth(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should call weights.get_month method", async () => {
    mockMakeApiRequest.mockResolvedValue({ month: { day: [] } });

    await getWeightMonth(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.objectContaining({
        method: "weights.get_month",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should handle weight entries with only kg", async () => {
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_kg: "75.5",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig);

    expect(result.month.day).toHaveLength(1);
  });

  it("should handle weight entries with only lbs", async () => {
    const mockResponse: WeightMonthResponseParsed = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_lbs: "166.4",
          },
        ],
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getWeightMonth(authenticatedConfig);

    expect(result.month.day).toHaveLength(1);
  });
});

describe("updateWeight", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;
  let mockDateToFatSecretFormat: ReturnType<typeof vi.fn>;

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
    const dateModule = await import("../../utils/date.js");
    mockDateToFatSecretFormat = dateModule.dateToFatSecretFormat as ReturnType<typeof vi.fn>;
  });

  it("should update weight with required params only", async () => {
    const mockResponse: WeightUpdateResponseParsed = {
      success: { value: "1" },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await updateWeight(authenticatedConfig, {
      currentWeightKg: 75.5,
    });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "weight.update",
        current_weight_kg: "75.5",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should update weight with all optional params", async () => {
    const mockResponse: WeightUpdateResponseParsed = {
      success: { value: "1" },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await updateWeight(authenticatedConfig, {
      currentWeightKg: 75.5,
      date: "2024-01-15",
      weightType: "kg",
      heightType: "cm",
      goalWeightKg: 70.0,
      currentHeightCm: 180,
      comment: "Morning weight",
    });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "weight.update",
        current_weight_kg: "75.5",
        date: "19737",
        weight_type: "kg",
        height_type: "cm",
        goal_weight_kg: "70",
        current_height_cm: "180",
        weight_comment: "Morning weight",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(
      updateWeight(unauthenticatedConfig, { currentWeightKg: 75.5 })
    ).rejects.toThrow("User authentication required");
  });

  it("should throw error when access token secret is missing", async () => {
    const configWithoutSecret: FatSecretConfig = {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      accessToken: "test_access_token",
    };

    await expect(
      updateWeight(configWithoutSecret, { currentWeightKg: 75.5 })
    ).rejects.toThrow("User authentication required");
  });

  it("should throw error when weight is zero", async () => {
    await expect(
      updateWeight(authenticatedConfig, { currentWeightKg: 0 })
    ).rejects.toThrow("Weight must be greater than 0");
  });

  it("should throw error when weight is negative", async () => {
    await expect(
      updateWeight(authenticatedConfig, { currentWeightKg: -5 })
    ).rejects.toThrow("Weight must be greater than 0");
  });

  it("should use POST method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "1" } });

    await updateWeight(authenticatedConfig, { currentWeightKg: 75.5 });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "1" } });

    await updateWeight(authenticatedConfig, { currentWeightKg: 75.5 });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should not make API call when auth validation fails", async () => {
    try {
      await updateWeight(unauthenticatedConfig, { currentWeightKg: 75.5 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should not make API call when weight validation fails", async () => {
    try {
      await updateWeight(authenticatedConfig, { currentWeightKg: 0 });
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should convert date via dateToFatSecretFormat", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "1" } });

    await updateWeight(authenticatedConfig, {
      currentWeightKg: 75.5,
      date: "2024-01-15",
    });

    expect(mockDateToFatSecretFormat).toHaveBeenCalledWith("2024-01-15");
    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        date: "19737",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should only include provided optional params", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "1" } });

    await updateWeight(authenticatedConfig, {
      currentWeightKg: 75.5,
      weightType: "lb",
    });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      {
        method: "weight.update",
        current_weight_kg: "75.5",
        weight_type: "lb",
      },
      authenticatedConfig,
      true,
      expect.anything()
    );

    // Verify that undefined optional params are not included
    const callArgs = mockMakeApiRequest.mock.calls[0][1];
    expect(callArgs).not.toHaveProperty("date");
    expect(callArgs).not.toHaveProperty("height_type");
    expect(callArgs).not.toHaveProperty("goal_weight_kg");
    expect(callArgs).not.toHaveProperty("current_height_cm");
    expect(callArgs).not.toHaveProperty("weight_comment");
  });

  it("should call weight.update method", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "1" } });

    await updateWeight(authenticatedConfig, { currentWeightKg: 75.5 });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        method: "weight.update",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should convert numeric params to strings", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "1" } });

    await updateWeight(authenticatedConfig, {
      currentWeightKg: 75.5,
      goalWeightKg: 70.0,
      currentHeightCm: 180,
    });

    const callArgs = mockMakeApiRequest.mock.calls[0][1];
    expect(typeof callArgs.current_weight_kg).toBe("string");
    expect(typeof callArgs.goal_weight_kg).toBe("string");
    expect(typeof callArgs.current_height_cm).toBe("string");
  });

  it("should handle weight with lb type", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "1" } });

    await updateWeight(authenticatedConfig, {
      currentWeightKg: 75.5,
      weightType: "lb",
    });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        weight_type: "lb",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should handle height with inch type", async () => {
    mockMakeApiRequest.mockResolvedValue({ success: { value: "1" } });

    await updateWeight(authenticatedConfig, {
      currentWeightKg: 75.5,
      heightType: "inch",
    });

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "POST",
      expect.objectContaining({
        height_type: "inch",
      }),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });
});
