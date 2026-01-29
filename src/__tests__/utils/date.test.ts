import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { dateToFatSecretFormat } from "../../utils/date.js";

describe("dateToFatSecretFormat", () => {
  describe("with explicit date", () => {
    it("should convert epoch start to 0", () => {
      expect(dateToFatSecretFormat("1970-01-01")).toBe("0");
    });

    it("should convert 2024-01-01 correctly", () => {
      expect(dateToFatSecretFormat("2024-01-01")).toBe("19723");
    });

    it("should convert 2024-01-15 correctly", () => {
      expect(dateToFatSecretFormat("2024-01-15")).toBe("19737");
    });

    it("should convert date in 2000 correctly", () => {
      // Jan 1, 2000 = 10957 days since epoch
      expect(dateToFatSecretFormat("2000-01-01")).toBe("10957");
    });

    it("should handle leap year date", () => {
      // Feb 29, 2024 is a valid leap year date
      expect(dateToFatSecretFormat("2024-02-29")).toBe("19782");
    });

    it("should handle end of year date", () => {
      expect(dateToFatSecretFormat("2023-12-31")).toBe("19722");
    });

    it("should return string type", () => {
      const result = dateToFatSecretFormat("2024-01-01");
      expect(typeof result).toBe("string");
    });
  });

  describe("with undefined date (today)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return today's date when undefined", () => {
      // Set to 2024-01-15 00:00:00 UTC
      vi.setSystemTime(new Date("2024-01-15T00:00:00Z"));

      const result = dateToFatSecretFormat(undefined);

      // Should be close to 19737 (exact value may vary slightly due to timezone handling)
      const numResult = parseInt(result, 10);
      expect(numResult).toBeGreaterThanOrEqual(19736);
      expect(numResult).toBeLessThanOrEqual(19738);
    });

    it("should return string for undefined input", () => {
      vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));

      const result = dateToFatSecretFormat();
      expect(typeof result).toBe("string");
    });

    it("should return positive number for any modern date", () => {
      vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));

      const result = dateToFatSecretFormat();
      const numResult = parseInt(result, 10);
      expect(numResult).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle date before epoch (negative result)", () => {
      const result = dateToFatSecretFormat("1969-12-31");
      expect(result).toBe("-1");
    });

    it("should handle very old date", () => {
      const result = dateToFatSecretFormat("1900-01-01");
      const numResult = parseInt(result, 10);
      expect(numResult).toBeLessThan(0);
    });

    it("should handle future date", () => {
      const result = dateToFatSecretFormat("2030-01-01");
      const numResult = parseInt(result, 10);
      expect(numResult).toBeGreaterThan(20000);
    });

    it("should handle invalid date string gracefully", () => {
      // Invalid date strings result in NaN which becomes "NaN"
      const result = dateToFatSecretFormat("not-a-date");
      expect(result).toBe("NaN");
    });

    it("should handle empty string as current UTC date", () => {
      // Empty string + "T00:00:00Z" = "T00:00:00Z" which JavaScript parses
      // as current date at midnight UTC (implementation detail)
      const result = dateToFatSecretFormat("");
      const numResult = parseInt(result, 10);
      // Should be a reasonable positive number (days since epoch)
      expect(numResult).toBeGreaterThan(0);
    });

    it("should handle malformed date format", () => {
      // Dates in wrong format with T00:00:00Z suffix
      const result = dateToFatSecretFormat("01-15-2024");
      // JavaScript Date parsing is lenient, this may parse unexpectedly
      // Just verify it returns a string (behavior is implementation-defined)
      expect(typeof result).toBe("string");
    });

    it("should handle partial date string as first day of month", () => {
      // "2024-01" + "T00:00:00Z" = "2024-01T00:00:00Z"
      // JavaScript parses this as 2024-01-01T00:00:00Z
      const result = dateToFatSecretFormat("2024-01");
      // Should equal 2024-01-01
      expect(result).toBe("19723");
    });
  });
});
