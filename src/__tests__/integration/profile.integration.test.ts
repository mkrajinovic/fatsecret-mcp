import { describe, it, expect, beforeEach } from "vitest";
import { hasAuthTokens, authConfig, API_TIMEOUT, waitForRateLimit } from "./setup.js";
import { getProfile } from "../../methods/profile.js";

beforeEach(async () => {
  await waitForRateLimit();
});

describe.skipIf(!hasAuthTokens)("Profile Integration Tests", () => {
  describe("getProfile", () => {
    it(
      "should return user profile",
      async () => {
        const result = await getProfile(authConfig);

        expect(result).toBeDefined();
        expect(result.profile).toBeDefined();
      },
      API_TIMEOUT
    );

    it(
      "should contain profile data",
      async () => {
        const result = await getProfile(authConfig);

        // Profile should have some data (structure varies by user)
        expect(result.profile).toBeDefined();
        expect(Object.keys(result.profile).length).toBeGreaterThan(0);
      },
      API_TIMEOUT
    );

    it(
      "should contain measurement preferences",
      async () => {
        const result = await getProfile(authConfig);

        // Check for measurement preferences (case-insensitive, API may return "Cm", "Kg", etc.)
        if (result.profile.height_measure) {
          expect(["cm", "inch"]).toContain(result.profile.height_measure.toLowerCase());
        }
        if (result.profile.weight_measure) {
          expect(["kg", "lb"]).toContain(result.profile.weight_measure.toLowerCase());
        }
      },
      API_TIMEOUT
    );

    it(
      "should return weight data when available",
      async () => {
        const result = await getProfile(authConfig);

        // If user has weight data, it should be valid
        if (result.profile.last_weight_kg) {
          const weight = parseFloat(result.profile.last_weight_kg);
          expect(weight).toBeGreaterThan(0);
        }

        if (result.profile.goal_weight_kg) {
          const goalWeight = parseFloat(result.profile.goal_weight_kg);
          expect(goalWeight).toBeGreaterThan(0);
        }
      },
      API_TIMEOUT
    );

    it(
      "should return date as integer format",
      async () => {
        const result = await getProfile(authConfig);

        // If last weight date is present, it should be a valid integer date
        if (result.profile.last_weight_date_int) {
          const dateInt = parseInt(result.profile.last_weight_date_int);
          expect(Number.isInteger(dateInt)).toBe(true);
          // FatSecret date format is days since 1970-01-01
          // Should be a reasonable value (after year 2000 = ~10957 days)
          expect(dateInt).toBeGreaterThan(10000);
        }
      },
      API_TIMEOUT
    );
  });
});
