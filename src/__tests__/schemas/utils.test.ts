import { describe, it, expect } from "vitest";
import { normalizeToArray } from "../../schemas/utils.js";

describe("normalizeToArray helper", () => {
  it("should return empty array for undefined", () => {
    expect(normalizeToArray(undefined)).toEqual([]);
  });

  it("should return empty array for null", () => {
    expect(normalizeToArray(null as unknown as undefined)).toEqual([]);
  });

  it("should wrap single value in array", () => {
    expect(normalizeToArray("test")).toEqual(["test"]);
    expect(normalizeToArray({ id: 1 })).toEqual([{ id: 1 }]);
  });

  it("should return array as-is", () => {
    expect(normalizeToArray(["a", "b"])).toEqual(["a", "b"]);
    expect(normalizeToArray([1, 2, 3])).toEqual([1, 2, 3]);
  });
});
