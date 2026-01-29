import { describe, it, expect } from "vitest";
import { z } from "zod";
import { ApiValidationError, FatSecretApiError } from "../../schemas/error.js";

describe("ApiValidationError", () => {
  it("should create error with formatted message", () => {
    const zodError = new z.ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["foods", "food", 0, "food_id"],
        message: "Expected string, received number",
      },
    ]);

    const error = new ApiValidationError(zodError, { invalid: "data" });

    expect(error.name).toBe("ApiValidationError");
    expect(error.message).toContain("API response validation failed");
    expect(error.message).toContain("foods.food.0.food_id");
    expect(error.issues).toHaveLength(1);
    expect(error.rawResponse).toEqual({ invalid: "data" });
  });

  it("should limit error messages to 5", () => {
    const issues = Array.from({ length: 10 }, (_, i) => ({
      code: "invalid_type" as const,
      expected: "string" as const,
      received: "number" as const,
      path: [`field${i}`],
      message: `Error ${i}`,
    }));

    const zodError = new z.ZodError(issues);
    const error = new ApiValidationError(zodError, {});

    const errorCount = (error.message.match(/field\d/g) || []).length;
    expect(errorCount).toBe(5);
  });

  it("should provide getTree method for debugging", () => {
    const zodError = new z.ZodError([
      {
        code: "custom",
        path: ["test"],
        message: "Custom error",
      },
    ]);

    const error = new ApiValidationError(zodError, {});
    const tree = error.getTree();

    expect(tree).toBeDefined();
    expect(tree.properties).toBeDefined();
  });
});

describe("FatSecretApiError", () => {
  it("should create error with code and message", () => {
    const error = new FatSecretApiError(2, "Invalid ID");

    expect(error.name).toBe("FatSecretApiError");
    expect(error.code).toBe(2);
    expect(error.message).toBe("FatSecret API error 2: Invalid ID");
  });

  it("should be an instance of Error", () => {
    const error = new FatSecretApiError(101, "Method not found");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(FatSecretApiError);
  });
});
