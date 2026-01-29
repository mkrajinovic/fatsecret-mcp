import { describe, it, expect, vi, beforeEach } from "vitest";
import { FatSecretClient } from "../client.js";
import type { FatSecretConfig } from "../types.js";

// Mock all methods
vi.mock("../methods/index.js", () => ({
  searchFoods: vi.fn(),
  getFood: vi.fn(),
  searchRecipes: vi.fn(),
  getRecipe: vi.fn(),
  getProfile: vi.fn(),
  getFoodEntries: vi.fn(),
  createFoodEntry: vi.fn(),
  getWeightMonth: vi.fn(),
  getRequestToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

vi.mock("../methods/auth.js", () => ({
  AUTHORIZE_URL: "https://authentication.fatsecret.com/oauth/authorize",
  getRequestToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

describe("FatSecretClient", () => {
  const baseConfig: FatSecretConfig = {
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
  };

  const authenticatedConfig: FatSecretConfig = {
    ...baseConfig,
    accessToken: "test_access_token",
    accessTokenSecret: "test_access_secret",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create client with config", () => {
      const client = new FatSecretClient(baseConfig);
      expect(client).toBeDefined();
    });

    it("should expose authorizeUrl", () => {
      const client = new FatSecretClient(baseConfig);
      expect(client.authorizeUrl).toBe("https://authentication.fatsecret.com/oauth/authorize");
    });
  });

  describe("getConfig", () => {
    it("should return copy of config", () => {
      const client = new FatSecretClient(baseConfig);
      const config = client.getConfig();

      expect(config.clientId).toBe("test_client_id");
      expect(config.clientSecret).toBe("test_client_secret");
    });

    it("should return a copy, not the original", () => {
      const client = new FatSecretClient(baseConfig);
      const config1 = client.getConfig();
      const config2 = client.getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe("updateConfig", () => {
    it("should update config with new values", () => {
      const client = new FatSecretClient(baseConfig);

      client.updateConfig({
        accessToken: "new_token",
        accessTokenSecret: "new_secret",
      });

      const config = client.getConfig();
      expect(config.accessToken).toBe("new_token");
      expect(config.accessTokenSecret).toBe("new_secret");
    });

    it("should preserve existing values when updating", () => {
      const client = new FatSecretClient(baseConfig);

      client.updateConfig({ accessToken: "token" });

      const config = client.getConfig();
      expect(config.clientId).toBe("test_client_id");
      expect(config.clientSecret).toBe("test_client_secret");
    });

    it("should allow partial updates", () => {
      const client = new FatSecretClient(authenticatedConfig);

      client.updateConfig({ accessToken: "updated_token" });

      const config = client.getConfig();
      expect(config.accessToken).toBe("updated_token");
      expect(config.accessTokenSecret).toBe("test_access_secret");
    });
  });

  describe("hasCredentials", () => {
    it("should return true when client credentials exist", () => {
      const client = new FatSecretClient(baseConfig);
      expect(client.hasCredentials()).toBe(true);
    });

    it("should return false when clientId is missing", () => {
      const client = new FatSecretClient({
        clientId: "",
        clientSecret: "secret",
      });
      expect(client.hasCredentials()).toBe(false);
    });

    it("should return false when clientSecret is missing", () => {
      const client = new FatSecretClient({
        clientId: "id",
        clientSecret: "",
      });
      expect(client.hasCredentials()).toBe(false);
    });

    it("should return false when both are missing", () => {
      const client = new FatSecretClient({
        clientId: "",
        clientSecret: "",
      });
      expect(client.hasCredentials()).toBe(false);
    });
  });

  describe("hasAccessToken", () => {
    it("should return true when access tokens exist", () => {
      const client = new FatSecretClient(authenticatedConfig);
      expect(client.hasAccessToken()).toBe(true);
    });

    it("should return false when accessToken is missing", () => {
      const client = new FatSecretClient({
        ...baseConfig,
        accessTokenSecret: "secret",
      });
      expect(client.hasAccessToken()).toBe(false);
    });

    it("should return false when accessTokenSecret is missing", () => {
      const client = new FatSecretClient({
        ...baseConfig,
        accessToken: "token",
      });
      expect(client.hasAccessToken()).toBe(false);
    });

    it("should return false when both are missing", () => {
      const client = new FatSecretClient(baseConfig);
      expect(client.hasAccessToken()).toBe(false);
    });

    it("should return false when accessToken is empty string", () => {
      const client = new FatSecretClient({
        ...baseConfig,
        accessToken: "",
        accessTokenSecret: "secret",
      });
      expect(client.hasAccessToken()).toBe(false);
    });

    it("should return false when accessTokenSecret is empty string", () => {
      const client = new FatSecretClient({
        ...baseConfig,
        accessToken: "token",
        accessTokenSecret: "",
      });
      expect(client.hasAccessToken()).toBe(false);
    });
  });

  describe("searchFoods", () => {
    it("should delegate to methods.searchFoods", async () => {
      const methods = await import("../methods/index.js");
      const mockSearchFoods = methods.searchFoods as ReturnType<typeof vi.fn>;
      mockSearchFoods.mockResolvedValue({ foods_search: { results: { food: [] } } });

      const client = new FatSecretClient(baseConfig);
      await client.searchFoods("apple");

      expect(mockSearchFoods).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: "test_client_id" }),
        "apple",
        undefined
      );
    });

    it("should pass options parameter", async () => {
      const methods = await import("../methods/index.js");
      const mockSearchFoods = methods.searchFoods as ReturnType<typeof vi.fn>;
      mockSearchFoods.mockResolvedValue({ foods_search: { results: { food: [] } } });

      const client = new FatSecretClient(baseConfig);
      const options = { pageNumber: 2, maxResults: 50 };
      await client.searchFoods("banana", options);

      expect(mockSearchFoods).toHaveBeenCalledWith(
        expect.any(Object),
        "banana",
        options
      );
    });
  });

  describe("getFood", () => {
    it("should delegate to methods.getFood", async () => {
      const methods = await import("../methods/index.js");
      const mockGetFood = methods.getFood as ReturnType<typeof vi.fn>;
      mockGetFood.mockResolvedValue({ food: {} });

      const client = new FatSecretClient(baseConfig);
      await client.getFood("12345");

      expect(mockGetFood).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: "test_client_id" }),
        "12345",
        undefined
      );
    });

    it("should pass options parameter", async () => {
      const methods = await import("../methods/index.js");
      const mockGetFood = methods.getFood as ReturnType<typeof vi.fn>;
      mockGetFood.mockResolvedValue({ food: {} });

      const client = new FatSecretClient(baseConfig);
      const options = { includeFoodImages: true };
      await client.getFood("12345", options);

      expect(mockGetFood).toHaveBeenCalledWith(
        expect.any(Object),
        "12345",
        options
      );
    });
  });

  describe("searchRecipes", () => {
    it("should delegate to methods.searchRecipes", async () => {
      const methods = await import("../methods/index.js");
      const mockSearchRecipes = methods.searchRecipes as ReturnType<typeof vi.fn>;
      mockSearchRecipes.mockResolvedValue({ recipes: { recipe: [] } });

      const client = new FatSecretClient(baseConfig);
      await client.searchRecipes("pasta");

      expect(mockSearchRecipes).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: "test_client_id" }),
        "pasta",
        undefined
      );
    });

    it("should pass options parameter", async () => {
      const methods = await import("../methods/index.js");
      const mockSearchRecipes = methods.searchRecipes as ReturnType<typeof vi.fn>;
      mockSearchRecipes.mockResolvedValue({ recipes: { recipe: [] } });

      const client = new FatSecretClient(baseConfig);
      const options = { recipeType: "Main Dish", pageNumber: 1, maxResults: 30 };
      await client.searchRecipes("pasta", options);

      expect(mockSearchRecipes).toHaveBeenCalledWith(
        expect.any(Object),
        "pasta",
        options
      );
    });
  });

  describe("getRecipe", () => {
    it("should delegate to methods.getRecipe", async () => {
      const methods = await import("../methods/index.js");
      const mockGetRecipe = methods.getRecipe as ReturnType<typeof vi.fn>;
      mockGetRecipe.mockResolvedValue({ recipe: {} });

      const client = new FatSecretClient(baseConfig);
      await client.getRecipe("67890");

      expect(mockGetRecipe).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: "test_client_id" }),
        "67890",
        undefined
      );
    });

    it("should pass options parameter", async () => {
      const methods = await import("../methods/index.js");
      const mockGetRecipe = methods.getRecipe as ReturnType<typeof vi.fn>;
      mockGetRecipe.mockResolvedValue({ recipe: {} });

      const client = new FatSecretClient(baseConfig);
      const options = { region: "US", language: "en" };
      await client.getRecipe("67890", options);

      expect(mockGetRecipe).toHaveBeenCalledWith(
        expect.any(Object),
        "67890",
        options
      );
    });
  });

  describe("getProfile", () => {
    it("should delegate to methods.getProfile", async () => {
      const methods = await import("../methods/index.js");
      const mockGetProfile = methods.getProfile as ReturnType<typeof vi.fn>;
      mockGetProfile.mockResolvedValue({ profile: { user_id: "123" } });

      const client = new FatSecretClient(authenticatedConfig);
      await client.getProfile();

      expect(mockGetProfile).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: "test_access_token" })
      );
    });
  });

  describe("getFoodEntries", () => {
    it("should delegate to methods.getFoodEntries", async () => {
      const methods = await import("../methods/index.js");
      const mockGetFoodEntries = methods.getFoodEntries as ReturnType<typeof vi.fn>;
      mockGetFoodEntries.mockResolvedValue({ food_entries: {} });

      const client = new FatSecretClient(authenticatedConfig);
      await client.getFoodEntries();

      expect(mockGetFoodEntries).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: "test_access_token" }),
        undefined
      );
    });

    it("should pass date parameter", async () => {
      const methods = await import("../methods/index.js");
      const mockGetFoodEntries = methods.getFoodEntries as ReturnType<typeof vi.fn>;
      mockGetFoodEntries.mockResolvedValue({ food_entries: {} });

      const client = new FatSecretClient(authenticatedConfig);
      await client.getFoodEntries("2024-01-15");

      expect(mockGetFoodEntries).toHaveBeenCalledWith(
        expect.any(Object),
        "2024-01-15"
      );
    });
  });

  describe("createFoodEntry", () => {
    it("should delegate to methods.createFoodEntry", async () => {
      const methods = await import("../methods/index.js");
      const mockCreateFoodEntry = methods.createFoodEntry as ReturnType<typeof vi.fn>;
      mockCreateFoodEntry.mockResolvedValue({ food_entry_id: { value: "123" } });

      const client = new FatSecretClient(authenticatedConfig);
      const params = {
        foodId: "12345",
        foodName: "Apple",
        servingId: "1",
        quantity: 1,
        mealType: "breakfast",
      };

      await client.createFoodEntry(params);

      expect(mockCreateFoodEntry).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: "test_access_token" }),
        params
      );
    });
  });

  describe("getWeightMonth", () => {
    it("should delegate to methods.getWeightMonth", async () => {
      const methods = await import("../methods/index.js");
      const mockGetWeightMonth = methods.getWeightMonth as ReturnType<typeof vi.fn>;
      mockGetWeightMonth.mockResolvedValue({ month: {} });

      const client = new FatSecretClient(authenticatedConfig);
      await client.getWeightMonth();

      expect(mockGetWeightMonth).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: "test_access_token" }),
        undefined
      );
    });

    it("should pass date parameter", async () => {
      const methods = await import("../methods/index.js");
      const mockGetWeightMonth = methods.getWeightMonth as ReturnType<typeof vi.fn>;
      mockGetWeightMonth.mockResolvedValue({ month: {} });

      const client = new FatSecretClient(authenticatedConfig);
      await client.getWeightMonth("2024-01-15");

      expect(mockGetWeightMonth).toHaveBeenCalledWith(
        expect.any(Object),
        "2024-01-15"
      );
    });
  });

  describe("getRequestToken", () => {
    it("should delegate to methods.getRequestToken", async () => {
      const methods = await import("../methods/index.js");
      const mockGetRequestToken = methods.getRequestToken as ReturnType<typeof vi.fn>;
      mockGetRequestToken.mockResolvedValue({
        oauth_token: "token",
        oauth_token_secret: "secret",
      });

      const client = new FatSecretClient(baseConfig);
      await client.getRequestToken();

      expect(mockGetRequestToken).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: "test_client_id" }),
        undefined
      );
    });

    it("should pass callback URL", async () => {
      const methods = await import("../methods/index.js");
      const mockGetRequestToken = methods.getRequestToken as ReturnType<typeof vi.fn>;
      mockGetRequestToken.mockResolvedValue({
        oauth_token: "token",
        oauth_token_secret: "secret",
      });

      const client = new FatSecretClient(baseConfig);
      await client.getRequestToken("https://myapp.com/callback");

      expect(mockGetRequestToken).toHaveBeenCalledWith(
        expect.any(Object),
        "https://myapp.com/callback"
      );
    });
  });

  describe("getAccessToken", () => {
    it("should delegate to methods.getAccessToken", async () => {
      const methods = await import("../methods/index.js");
      const mockGetAccessToken = methods.getAccessToken as ReturnType<typeof vi.fn>;
      mockGetAccessToken.mockResolvedValue({
        oauth_token: "access_token",
        oauth_token_secret: "access_secret",
      });

      const client = new FatSecretClient(baseConfig);
      await client.getAccessToken("req_token", "req_secret", "verifier");

      expect(mockGetAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: "test_client_id" }),
        "req_token",
        "req_secret",
        "verifier"
      );
    });
  });

  describe("config isolation", () => {
    it("should use updated config for subsequent calls", async () => {
      const methods = await import("../methods/index.js");
      const mockGetProfile = methods.getProfile as ReturnType<typeof vi.fn>;
      mockGetProfile.mockResolvedValue({ profile: { user_id: "123" } });

      const client = new FatSecretClient(baseConfig);

      client.updateConfig({
        accessToken: "new_token",
        accessTokenSecret: "new_secret",
      });

      await client.getProfile();

      expect(mockGetProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: "new_token",
          accessTokenSecret: "new_secret",
        })
      );
    });

    it("should not affect other client instances", () => {
      const client1 = new FatSecretClient(baseConfig);
      const client2 = new FatSecretClient(baseConfig);

      client1.updateConfig({ accessToken: "token1" });
      client2.updateConfig({ accessToken: "token2" });

      expect(client1.getConfig().accessToken).toBe("token1");
      expect(client2.getConfig().accessToken).toBe("token2");
    });
  });
});
