import { describe, it, expect } from "vitest";
import { WeightMonthResponseSchema } from "../../schemas/weight.js";

describe("WeightMonthResponseSchema", () => {
  it("should validate valid weight month response", () => {
    const validResponse = {
      month: {
        day: [
          {
            date_int: "19737",
            weight_kg: "75.5",
            weight_lbs: "166.4",
          },
        ],
      },
    };

    const result = WeightMonthResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should normalize single day to array", () => {
    const responseWithSingleDay = {
      month: {
        day: {
          date_int: "19737",
          weight_kg: "75.5",
        },
      },
    };

    const result = WeightMonthResponseSchema.safeParse(responseWithSingleDay);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.month.day)).toBe(true);
    }
  });

  it("should handle empty month data", () => {
    const emptyResponse = {
      month: {},
    };

    const result = WeightMonthResponseSchema.safeParse(emptyResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.month.day).toEqual([]);
    }
  });
});
