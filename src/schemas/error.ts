import { z } from "zod";

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
  }),
});

/**
 * Error thrown when FatSecret API returns an error response.
 * Contains the error code and message from the API.
 */
export class FatSecretApiError extends Error {
  public readonly code: number;

  constructor(code: number, message: string) {
    super(`FatSecret API error ${code}: ${message}`);
    this.name = "FatSecretApiError";
    this.code = code;
  }
}

/**
 * Custom error class for API validation failures.
 * Contains detailed information about what validation failed.
 */
export class ApiValidationError extends Error {
  public readonly issues: z.ZodIssue[];
  public readonly rawResponse: unknown;

  constructor(error: z.ZodError, rawResponse: unknown) {
    const errorMessages = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .slice(0, 5)
      .join("; ");

    const message = `API response validation failed: ${errorMessages || "Invalid response structure"}`;
    super(message);
    this.name = "ApiValidationError";
    this.issues = error.issues;
    this.rawResponse = rawResponse;
  }

  /**
   * Get a tree representation of the error for debugging.
   */
  getTree() {
    return z.treeifyError(new z.ZodError(this.issues));
  }
}
