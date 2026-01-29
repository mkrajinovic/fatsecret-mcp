import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRequestToken, getAccessToken, AUTHORIZE_URL } from "../../methods/auth.js";
import type { FatSecretConfig } from "../../types.js";
import type { OAuthTokenResponseParsed, AccessTokenResponseParsed } from "../../schemas.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeOAuthRequest: vi.fn(),
}));

describe("getRequestToken", () => {
  let mockMakeOAuthRequest: ReturnType<typeof vi.fn>;

  const testConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeOAuthRequest = requestModule.makeOAuthRequest as ReturnType<typeof vi.fn>;
  });

  it("should get request token with default callback", async () => {
    const mockResponse: OAuthTokenResponseParsed = {
      oauth_token: "request_token_123",
      oauth_token_secret: "request_secret_456",
      oauth_callback_confirmed: "true",
    };

    mockMakeOAuthRequest.mockResolvedValue(mockResponse);

    const result = await getRequestToken(testConfig);

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      "POST",
      "https://authentication.fatsecret.com/oauth/request_token",
      { oauth_callback: "oob" },
      testConfig,
      undefined,
      undefined,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get request token with custom callback URL", async () => {
    const callbackUrl = "https://myapp.com/callback";
    const mockResponse: OAuthTokenResponseParsed = {
      oauth_token: "token123",
      oauth_token_secret: "secret456",
    };

    mockMakeOAuthRequest.mockResolvedValue(mockResponse);

    const result = await getRequestToken(testConfig, callbackUrl);

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      "POST",
      "https://authentication.fatsecret.com/oauth/request_token",
      { oauth_callback: callbackUrl },
      testConfig,
      undefined,
      undefined,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should use POST method", async () => {
    mockMakeOAuthRequest.mockResolvedValue({
      oauth_token: "token",
      oauth_token_secret: "secret",
    });

    await getRequestToken(testConfig);

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      "POST",
      expect.any(String),
      expect.any(Object),
      testConfig,
      undefined,
      undefined,
      expect.anything()
    );
  });

  it("should call correct request token URL", async () => {
    mockMakeOAuthRequest.mockResolvedValue({
      oauth_token: "token",
      oauth_token_secret: "secret",
    });

    await getRequestToken(testConfig);

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      expect.any(String),
      "https://authentication.fatsecret.com/oauth/request_token",
      expect.any(Object),
      testConfig,
      undefined,
      undefined,
      expect.anything()
    );
  });

  it("should handle callback confirmed response", async () => {
    const mockResponse: OAuthTokenResponseParsed = {
      oauth_token: "token",
      oauth_token_secret: "secret",
      oauth_callback_confirmed: "true",
    };

    mockMakeOAuthRequest.mockResolvedValue(mockResponse);

    const result = await getRequestToken(testConfig);

    expect(result.oauth_callback_confirmed).toBe("true");
  });

  it("should return token and secret", async () => {
    mockMakeOAuthRequest.mockResolvedValue({
      oauth_token: "my_token",
      oauth_token_secret: "my_secret",
    });

    const result = await getRequestToken(testConfig);

    expect(result.oauth_token).toBe("my_token");
    expect(result.oauth_token_secret).toBe("my_secret");
  });
});

describe("getAccessToken", () => {
  let mockMakeOAuthRequest: ReturnType<typeof vi.fn>;

  const testConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeOAuthRequest = requestModule.makeOAuthRequest as ReturnType<typeof vi.fn>;
  });

  it("should exchange request token for access token", async () => {
    const mockResponse: AccessTokenResponseParsed = {
      oauth_token: "access_token_123",
      oauth_token_secret: "access_secret_456",
      user_id: "user123",
    };

    mockMakeOAuthRequest.mockResolvedValue(mockResponse);

    const result = await getAccessToken(
      testConfig,
      "request_token",
      "request_secret",
      "verifier_code"
    );

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      "GET",
      "https://authentication.fatsecret.com/oauth/access_token",
      { oauth_verifier: "verifier_code" },
      testConfig,
      "request_token",
      "request_secret",
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should use GET method", async () => {
    mockMakeOAuthRequest.mockResolvedValue({
      oauth_token: "token",
      oauth_token_secret: "secret",
    });

    await getAccessToken(testConfig, "token", "secret", "verifier");

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(String),
      expect.any(Object),
      testConfig,
      expect.any(String),
      expect.any(String),
      expect.anything()
    );
  });

  it("should call correct access token URL", async () => {
    mockMakeOAuthRequest.mockResolvedValue({
      oauth_token: "token",
      oauth_token_secret: "secret",
    });

    await getAccessToken(testConfig, "token", "secret", "verifier");

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      expect.any(String),
      "https://authentication.fatsecret.com/oauth/access_token",
      expect.any(Object),
      testConfig,
      expect.any(String),
      expect.any(String),
      expect.anything()
    );
  });

  it("should pass request token and secret", async () => {
    mockMakeOAuthRequest.mockResolvedValue({
      oauth_token: "access_token",
      oauth_token_secret: "access_secret",
    });

    await getAccessToken(testConfig, "req_token", "req_secret", "verifier");

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(Object),
      testConfig,
      "req_token",
      "req_secret",
      expect.anything()
    );
  });

  it("should pass verifier in params", async () => {
    mockMakeOAuthRequest.mockResolvedValue({
      oauth_token: "token",
      oauth_token_secret: "secret",
    });

    await getAccessToken(testConfig, "token", "secret", "my_verifier");

    expect(mockMakeOAuthRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      { oauth_verifier: "my_verifier" },
      testConfig,
      expect.any(String),
      expect.any(String),
      expect.anything()
    );
  });

  it("should return access token and secret", async () => {
    mockMakeOAuthRequest.mockResolvedValue({
      oauth_token: "final_access_token",
      oauth_token_secret: "final_access_secret",
    });

    const result = await getAccessToken(testConfig, "req", "sec", "ver");

    expect(result.oauth_token).toBe("final_access_token");
    expect(result.oauth_token_secret).toBe("final_access_secret");
  });

  it("should handle response with user_id", async () => {
    const mockResponse: AccessTokenResponseParsed = {
      oauth_token: "token",
      oauth_token_secret: "secret",
      user_id: "12345",
    };

    mockMakeOAuthRequest.mockResolvedValue(mockResponse);

    const result = await getAccessToken(testConfig, "req", "sec", "ver");

    expect(result.user_id).toBe("12345");
  });

  it("should handle response without user_id", async () => {
    const mockResponse: AccessTokenResponseParsed = {
      oauth_token: "token",
      oauth_token_secret: "secret",
    };

    mockMakeOAuthRequest.mockResolvedValue(mockResponse);

    const result = await getAccessToken(testConfig, "req", "sec", "ver");

    expect(result.user_id).toBeUndefined();
  });
});

describe("AUTHORIZE_URL", () => {
  it("should export correct authorize URL", () => {
    expect(AUTHORIZE_URL).toBe("https://authentication.fatsecret.com/oauth/authorize");
  });
});
