import { describe, it, expect } from "vitest";
import {
  FoodEntriesResponseSchema,
  FoodEntryCreateResponseSchema,
} from "../../schemas/diary.js";

describe("FoodEntriesResponseSchema", () => {
  it("should validate valid food entries response", () => {
    const validResponse = {
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
          },
        ],
      },
    };

    const result = FoodEntriesResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should normalize single food entry to array", () => {
    const responseWithSingleEntry = {
      food_entries: {
        food_entry: {
          food_entry_id: "123",
          food_id: "456",
          food_entry_name: "Apple",
          serving_id: "1",
          number_of_units: "1",
          meal: "breakfast",
          date_int: "19737",
        },
      },
    };

    const result = FoodEntriesResponseSchema.safeParse(responseWithSingleEntry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.food_entries.food_entry)).toBe(true);
    }
  });

  it("should handle empty food entries", () => {
    const emptyResponse = {
      food_entries: {},
    };

    const result = FoodEntriesResponseSchema.safeParse(emptyResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.food_entries.food_entry).toEqual([]);
    }
  });

  it("should handle null food_entries", () => {
    const nullResponse = {
      food_entries: null,
    };

    const result = FoodEntriesResponseSchema.safeParse(nullResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.food_entries.food_entry).toEqual([]);
    }
  });

  it("should handle missing food_entries", () => {
    const missingResponse = {};

    const result = FoodEntriesResponseSchema.safeParse(missingResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.food_entries.food_entry).toEqual([]);
    }
  });
});

describe("FoodEntryCreateResponseSchema", () => {
  it("should validate valid create response", () => {
    const validResponse = {
      food_entry_id: {
        value: "98765",
      },
    };

    const result = FoodEntryCreateResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });
});
