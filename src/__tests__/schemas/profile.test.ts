import { describe, it, expect } from "vitest";
import { ProfileResponseSchema } from "../../schemas/profile.js";

describe("ProfileResponseSchema", () => {
  it("should validate valid profile response", () => {
    const validResponse = {
      profile: {
        user_id: "user123",
        first_name: "John",
        last_name: "Doe",
        height_measure: "cm",
        weight_measure: "kg",
      },
    };

    const result = ProfileResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should validate minimal profile", () => {
    const minimalResponse = {
      profile: {
        user_id: "user123",
      },
    };

    const result = ProfileResponseSchema.safeParse(minimalResponse);
    expect(result.success).toBe(true);
  });

  it("should validate profile without user_id", () => {
    const responseWithoutUserId = {
      profile: {
        first_name: "John",
        last_name: "Doe",
      },
    };

    const result = ProfileResponseSchema.safeParse(responseWithoutUserId);
    expect(result.success).toBe(true);
  });

  it("should validate empty profile", () => {
    const emptyProfile = {
      profile: {},
    };

    const result = ProfileResponseSchema.safeParse(emptyProfile);
    expect(result.success).toBe(true);
  });
});
