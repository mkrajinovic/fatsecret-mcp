import { z } from "zod";

/**
 * Normalizes a field that can be either a single object or an array to always return an array.
 * FatSecret API returns single object when there's one item, array when multiple.
 */
export function normalizeToArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Creates a Zod schema that accepts either a single item or an array and normalizes to array.
 */
export function singleOrArray<T extends z.ZodType>(schema: T) {
  return z.union([schema, z.array(schema)]).transform((val) =>
    Array.isArray(val) ? val : [val]
  );
}

/**
 * Creates an optional Zod schema that accepts single item, array, or undefined/null.
 * Always normalizes to array (empty array if undefined/null).
 */
export function optionalSingleOrArray<T extends z.ZodType>(schema: T) {
  return z.union([schema, z.array(schema)])
    .optional()
    .transform((val) => normalizeToArray(val));
}
