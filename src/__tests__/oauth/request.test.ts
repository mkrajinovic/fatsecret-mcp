import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { makeOAuthRequest, makeApiRequest } from "../../oauth/request.js";
import type { FatSecretConfig } from "../../types.js";

// Mock node-fetch
vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

// Mock signature module to control OAuth params
vi.mock("../../oauth/signature.js", () => ({
  buildOAuthParams: vi.fn(() => ({
    oauth_consumer_key: "test_client_id",
    oauth_nonce: "testnonce1234567890123456",
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: "1705320000",
    oauth_version: "1.0",
  })),
  generateSignature: vi.fn(() => "test_signature"),
}));

// Test schema that accepts any object
const testSchema = z.object({}).passthrough();

// OAuth token schema for specific tests
const oauthTokenSchema = z.object({
  oauth_token: z.string(),
  oauth_token_secret: z.string(),
});

describe("makeOAuthRequest", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const testConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const fetchModule = await import("node-fetch");
    mockFetch = fetchModule.default as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make GET request with query params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"result": "success"}'),
    });

    const result = await makeOAuthRequest(
      "GET",
      "https://api.example.com/resource",
      { param1: "value1" },
      testConfig,
      undefined,
      undefined,
      testSchema
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("https://api.example.com/resource?");
    expect(url).toContain("param1=value1");
    expect(options.method).toBe("GET");
    expect(result).toEqual({ result: "success" });
  });

  it("should make POST request with body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"result": "success"}'),
    });

    const result = await makeOAuthRequest(
      "POST",
      "https://api.example.com/resource",
      { param1: "value1" },
      testConfig,
      undefined,
      undefined,
      testSchema
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/resource");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(options.body).toContain("param1=value1");
    expect(result).toEqual({ result: "success" });
  });

  it("should include OAuth signature in params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"data": "test"}'),
    });

    await makeOAuthRequest(
      "GET",
      "https://api.example.com/resource",
      {},
      testConfig,
      undefined,
      undefined,
      testSchema
    );

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("oauth_signature=");
    expect(url).toContain("oauth_consumer_key=test_client_id");
  });

  it("should throw error on non-OK response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    await expect(
      makeOAuthRequest(
        "GET",
        "https://api.example.com",
        {},
        testConfig,
        undefined,
        undefined,
        testSchema
      )
    ).rejects.toThrow("OAuth error: 401 - Unauthorized");
  });

  it("should parse querystring response when JSON fails", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("oauth_token=token123&oauth_token_secret=secret456"),
    });

    const result = await makeOAuthRequest(
      "POST",
      "https://api.example.com/request_token",
      {},
      testConfig,
      undefined,
      undefined,
      oauthTokenSchema
    );

    expect(result).toEqual({
      oauth_token: "token123",
      oauth_token_secret: "secret456",
    });
  });

  it("should use token when provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"success": true}'),
    });

    await makeOAuthRequest(
      "GET",
      "https://api.example.com/resource",
      {},
      testConfig,
      "access_token",
      "access_secret",
      testSchema
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle empty params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });

    const result = await makeOAuthRequest(
      "GET",
      "https://api.example.com/resource",
      {},
      testConfig,
      undefined,
      undefined,
      testSchema
    );

    expect(result).toEqual({});
  });
});

describe("makeApiRequest", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const testConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const fetchModule = await import("node-fetch");
    mockFetch = fetchModule.default as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make GET request to FatSecret API", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"foods": {}}'),
    });

    await makeApiRequest(
      "GET",
      { method: "foods.search", search_expression: "apple" },
      testConfig,
      false,
      testSchema
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("https://platform.fatsecret.com/rest/server.api?");
    expect(url).toContain("method=foods.search");
    expect(url).toContain("format=json");
    expect(options.method).toBe("GET");
  });

  it("should make POST request with body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"food_entry_id": {"value": "123"}}'),
    });

    await makeApiRequest(
      "POST",
      { method: "food_entry.create", food_id: "123" },
      testConfig,
      true,
      testSchema
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://platform.fatsecret.com/rest/server.api");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(options.body).toContain("method=food_entry.create");
  });

  it("should add format=json to params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"result": "ok"}'),
    });

    await makeApiRequest(
      "GET",
      { method: "profile.get" },
      testConfig,
      true,
      testSchema
    );

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("format=json");
  });

  it("should throw error on non-OK response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    await expect(
      makeApiRequest(
        "GET",
        { method: "foods.search" },
        testConfig,
        false,
        testSchema
      )
    ).rejects.toThrow("FatSecret API error: 500 - Internal Server Error");
  });

  it("should work without access token when useAccessToken is false", async () => {
    const configWithoutToken: FatSecretConfig = {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"foods": {}}'),
    });

    await makeApiRequest(
      "GET",
      { method: "foods.search" },
      configWithoutToken,
      false,
      testSchema
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should not mutate original params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });

    const originalParams = { method: "foods.search" };
    const paramsCopy = { ...originalParams };

    await makeApiRequest("GET", originalParams, testConfig, false, testSchema);

    expect(originalParams).toEqual(paramsCopy);
  });

  it("should parse JSON response", async () => {
    const mockResponse = {
      foods: { food: [{ food_id: "1", food_name: "Apple" }] },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    });

    const result = await makeApiRequest(
      "GET",
      { method: "foods.search" },
      testConfig,
      false,
      testSchema
    );

    expect(result).toEqual(mockResponse);
  });

  it("should parse querystring response when JSON fails", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("key1=value1&key2=value2"),
    });

    const result = await makeApiRequest(
      "GET",
      { method: "some.method" },
      testConfig,
      false,
      testSchema
    );

    expect(result).toEqual({ key1: "value1", key2: "value2" });
  });
});
