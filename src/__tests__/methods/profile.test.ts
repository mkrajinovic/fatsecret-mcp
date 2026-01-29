import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProfile } from "../../methods/profile.js";
import type { FatSecretConfig } from "../../types.js";
import type { ProfileResponseParsed } from "../../schemas.js";

// Mock the request module
vi.mock("../../oauth/request.js", () => ({
  makeApiRequest: vi.fn(),
}));

describe("getProfile", () => {
  let mockMakeApiRequest: ReturnType<typeof vi.fn>;

  const authenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  const unauthenticatedConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const requestModule = await import("../../oauth/request.js");
    mockMakeApiRequest = requestModule.makeApiRequest as ReturnType<typeof vi.fn>;
  });

  it("should get user profile with valid access token", async () => {
    const mockResponse: ProfileResponseParsed = {
      profile: {
        user_id: "user123",
        first_name: "John",
        last_name: "Doe",
        height_measure: "cm",
        weight_measure: "kg",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getProfile(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      { method: "profile.get" },
      authenticatedConfig,
      true,
      expect.anything()
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw error when access token is missing", async () => {
    await expect(getProfile(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when access token secret is missing", async () => {
    const configWithoutSecret: FatSecretConfig = {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      accessToken: "test_access_token",
    };

    await expect(getProfile(configWithoutSecret)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should throw error when both tokens are missing", async () => {
    await expect(getProfile(unauthenticatedConfig)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should use useAccessToken=true for authenticated request", async () => {
    mockMakeApiRequest.mockResolvedValue({ profile: {} });

    await getProfile(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      expect.any(Object),
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should call profile.get method", async () => {
    mockMakeApiRequest.mockResolvedValue({ profile: {} });

    await getProfile(authenticatedConfig);

    expect(mockMakeApiRequest).toHaveBeenCalledWith(
      "GET",
      { method: "profile.get" },
      authenticatedConfig,
      true,
      expect.anything()
    );
  });

  it("should not make API call when auth is missing", async () => {
    try {
      await getProfile(unauthenticatedConfig);
    } catch {
      // expected
    }

    expect(mockMakeApiRequest).not.toHaveBeenCalled();
  });

  it("should handle profile with minimal data", async () => {
    const mockResponse: ProfileResponseParsed = {
      profile: {
        user_id: "user456",
      },
    };

    mockMakeApiRequest.mockResolvedValue(mockResponse);

    const result = await getProfile(authenticatedConfig);

    expect(result.profile.user_id).toBe("user456");
    expect(result.profile.first_name).toBeUndefined();
  });

  it("should handle empty accessToken string as missing", async () => {
    const configWithEmptyToken: FatSecretConfig = {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      accessToken: "",
      accessTokenSecret: "test_access_secret",
    };

    await expect(getProfile(configWithEmptyToken)).rejects.toThrow(
      "User authentication required"
    );
  });

  it("should handle empty accessTokenSecret string as missing", async () => {
    const configWithEmptySecret: FatSecretConfig = {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      accessToken: "test_access_token",
      accessTokenSecret: "",
    };

    await expect(getProfile(configWithEmptySecret)).rejects.toThrow(
      "User authentication required"
    );
  });
});
