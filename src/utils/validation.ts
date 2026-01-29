import type { FatSecretConfig } from "../types.js";

/**
 * Configuration with guaranteed access tokens (after auth)
 */
export interface AuthenticatedConfig extends FatSecretConfig {
  accessToken: string;
  accessTokenSecret: string;
}

/**
 * Type assertion that config has valid access tokens.
 * Throws if user authentication is missing.
 */
export function requireAuth(
  config: FatSecretConfig
): asserts config is AuthenticatedConfig {
  if (!config.accessToken || !config.accessTokenSecret) {
    throw new Error("User authentication required. Please complete the OAuth flow first.");
  }
}

/**
 * Validates that API credentials are set.
 * Throws if client ID or client secret is missing.
 */
export function requireCredentials(config: FatSecretConfig): void {
  if (!config.clientId || !config.clientSecret) {
    throw new Error("FatSecret API credentials are required. Please set clientId and clientSecret.");
  }
}

/**
 * Date format regex for YYYY-MM-DD
 */
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates and parses a date string in YYYY-MM-DD format.
 * Returns undefined if input is undefined, throws if format is invalid.
 */
export function validateDateFormat(dateString?: string): string | undefined {
  if (dateString === undefined) {
    return undefined;
  }

  if (!DATE_FORMAT_REGEX.test(dateString)) {
    throw new Error(`Invalid date format: "${dateString}". Expected YYYY-MM-DD format.`);
  }

  // Validate it's actually a valid date (e.g., not 2024-02-30)
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: "${dateString}". The date does not exist.`);
  }

  return dateString;
}

/**
 * Reasonable limits for numeric inputs
 */
export const LIMITS = {
  WEIGHT_KG_MIN: 0.1,
  WEIGHT_KG_MAX: 700, // World record is ~635kg
  HEIGHT_CM_MIN: 20,
  HEIGHT_CM_MAX: 300, // Tallest human ever was 272cm
  QUANTITY_MAX: 10000, // Reasonable upper limit for serving quantities
  CALORIES_MAX: 100000, // Reasonable upper limit for calorie search
  PREP_TIME_MAX: 10080, // 1 week in minutes
} as const;

/**
 * Validates weight in kg is within reasonable bounds.
 */
export function validateWeight(weight: number, fieldName = "Weight"): void {
  if (weight <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  if (weight > LIMITS.WEIGHT_KG_MAX) {
    throw new Error(`${fieldName} cannot exceed ${LIMITS.WEIGHT_KG_MAX} kg`);
  }
}

/**
 * Validates height in cm is within reasonable bounds.
 */
export function validateHeight(height: number, fieldName = "Height"): void {
  if (height <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  if (height > LIMITS.HEIGHT_CM_MAX) {
    throw new Error(`${fieldName} cannot exceed ${LIMITS.HEIGHT_CM_MAX} cm`);
  }
}

/**
 * Validates quantity is positive and within reasonable bounds.
 */
export function validateQuantity(quantity: number, fieldName = "Quantity"): void {
  if (quantity <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  if (quantity > LIMITS.QUANTITY_MAX) {
    throw new Error(`${fieldName} cannot exceed ${LIMITS.QUANTITY_MAX}`);
  }
}
