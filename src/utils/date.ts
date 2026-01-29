import { validateDateFormat } from "./validation.js";

/**
 * Convert a date string to FatSecret format (days since epoch)
 * @param dateString - Date in YYYY-MM-DD format, or undefined for today
 * @returns Number of days since January 1, 1970
 * @throws Error if dateString is provided but not in valid YYYY-MM-DD format
 */
export function dateToFatSecretFormat(dateString?: string): string {
  // Validate the date format if provided
  const validatedDate = validateDateFormat(dateString);

  const date = validatedDate ? new Date(validatedDate + "T00:00:00Z") : new Date();
  const epochStart = new Date("1970-01-01T00:00:00Z");
  const daysSinceEpoch = Math.floor(
    (date.getTime() - epochStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceEpoch.toString();
}
