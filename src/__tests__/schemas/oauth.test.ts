import { describe, it, expect } from "vitest";
import {
  OAuthTokenResponseSchema,
  AccessTokenResponseSchema,
} from "../../schemas/oauth.js";

describe("OAuthTokenResponseSchema", () => {
  it("should validate valid OAuth token response", () => {
    const validResponse = {
      oauth_token: "token123",
      oauth_token_secret: "secret456",
    };

    const result = OAuthTokenResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validResponse);
    }
  });

  it("should validate response with optional callback_confirmed", () => {
    const validResponse = {
      oauth_token: "token123",
      oauth_token_secret: "secret456",
      oauth_callback_confirmed: "true",
    };

    const result = OAuthTokenResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should fail for missing required fields", () => {
    const invalidResponse = {
      oauth_token: "token123",
    };

    const result = OAuthTokenResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it("should fail for extra fields (strict validation)", () => {
    const invalidResponse = {
      oauth_token: "token123",
      oauth_token_secret: "secret456",
      extra_field: "should fail",
    };

    const result = OAuthTokenResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});

describe("AccessTokenResponseSchema", () => {
  it("should validate valid access token response", () => {
    const validResponse = {
      oauth_token: "access_token",
      oauth_token_secret: "access_secret",
      user_id: "12345",
    };

    const result = AccessTokenResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should validate response without user_id", () => {
    const validResponse = {
      oauth_token: "access_token",
      oauth_token_secret: "access_secret",
    };

    const result = AccessTokenResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });
});
