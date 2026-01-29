import type { FatSecretConfig } from "../../types.js";

/**
 * Environment variables for integration tests
 */
const CLIENT_ID = process.env.FATSECRET_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET ?? "";
const ACCESS_TOKEN = process.env.FATSECRET_ACCESS_TOKEN ?? "";
const ACCESS_TOKEN_SECRET = process.env.FATSECRET_ACCESS_TOKEN_SECRET ?? "";

/**
 * Check if credentials are available for public API methods
 */
export const hasCredentials = Boolean(CLIENT_ID && CLIENT_SECRET);

/**
 * Check if auth tokens are available for user-specific methods
 */
export const hasAuthTokens = Boolean(ACCESS_TOKEN && ACCESS_TOKEN_SECRET);

/**
 * Config for public API methods (foods.search, food.get, recipes.search, recipe.get)
 */
export const config: FatSecretConfig = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
};

/**
 * Config for authenticated user methods (profile, diary, weight)
 * Includes access token for delegated requests (3-legged OAuth)
 */
export const authConfig: FatSecretConfig = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  accessToken: ACCESS_TOKEN,
  accessTokenSecret: ACCESS_TOKEN_SECRET,
};

/**
 * Test timeout for API calls (longer than default due to network latency)
 */
export const API_TIMEOUT = 30000;

/**
 * Delay between API calls to avoid rate limiting
 */
export const RATE_LIMIT_DELAY = 2000; // 2 seconds

/**
 * Helper to wait for rate limit delay
 */
export const waitForRateLimit = (): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

/**
 * Check if Premier API features are enabled (autocomplete, barcode)
 * Set FATSECRET_PREMIER=true in .env to enable these tests
 */
export const hasPremierAccess = process.env.FATSECRET_PREMIER === "true";
