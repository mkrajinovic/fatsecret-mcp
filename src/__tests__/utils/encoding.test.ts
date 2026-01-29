import { describe, it, expect } from "vitest";
import { percentEncode, encodeParams } from "../../utils/encoding.js";

describe("percentEncode", () => {
  it("should encode per RFC 3986", () => {
    expect(percentEncode("hello world")).toBe("hello%20world");
    expect(percentEncode("test!*'()")).toBe("test%21%2A%27%28%29");
    expect(percentEncode("abc-_.~123")).toBe("abc-_.~123");
  });

  it("should encode empty string", () => {
    expect(percentEncode("")).toBe("");
  });

  it("should encode special characters", () => {
    expect(percentEncode("@#$%^&")).toBe("%40%23%24%25%5E%26");
    expect(percentEncode("=+")).toBe("%3D%2B");
  });

  it("should preserve unreserved characters", () => {
    expect(percentEncode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~"))
      .toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~");
  });

  it("should encode unicode characters", () => {
    expect(percentEncode("cafe")).toBe("cafe");
  });

  it("should encode actual unicode characters with diacritics", () => {
    // e with acute accent (caf\u00e9)
    expect(percentEncode("caf\u00e9")).toBe("caf%C3%A9");
  });

  it("should encode ampersand correctly", () => {
    expect(percentEncode("foo&bar")).toBe("foo%26bar");
  });

  it("should encode equals sign correctly", () => {
    expect(percentEncode("a=b")).toBe("a%3Db");
  });

  it("should encode plus sign correctly", () => {
    expect(percentEncode("a+b")).toBe("a%2Bb");
  });

  it("should encode forward slash correctly", () => {
    expect(percentEncode("a/b")).toBe("a%2Fb");
  });

  it("should encode question mark correctly", () => {
    expect(percentEncode("what?")).toBe("what%3F");
  });

  it("should encode colon correctly", () => {
    expect(percentEncode("http:")).toBe("http%3A");
  });

  it("should encode complex URL correctly", () => {
    expect(percentEncode("https://example.com/path?q=1")).toBe(
      "https%3A%2F%2Fexample.com%2Fpath%3Fq%3D1"
    );
  });

  it("should encode emoji characters", () => {
    // Grinning face emoji: \u{1F600}
    const result = percentEncode("hello \u{1F600} world");
    // Emoji will be percent-encoded as UTF-8 bytes
    expect(result).toContain("%F0%9F%98%80");
  });

  it("should encode newline and tab characters", () => {
    expect(percentEncode("line1\nline2")).toBe("line1%0Aline2");
    expect(percentEncode("col1\tcol2")).toBe("col1%09col2");
  });
});

describe("encodeParams", () => {
  it("should encode simple key-value pairs", () => {
    const result = encodeParams({ foo: "bar", baz: "qux" });
    expect(result).toBe("foo=bar&baz=qux");
  });

  it("should encode empty object", () => {
    expect(encodeParams({})).toBe("");
  });

  it("should encode single parameter", () => {
    expect(encodeParams({ key: "value" })).toBe("key=value");
  });

  it("should encode parameters with special characters", () => {
    const result = encodeParams({ "search query": "hello world" });
    expect(result).toBe("search%20query=hello%20world");
  });

  it("should encode OAuth parameters correctly", () => {
    const result = encodeParams({
      oauth_consumer_key: "key123",
      oauth_signature_method: "HMAC-SHA1",
    });
    expect(result).toBe("oauth_consumer_key=key123&oauth_signature_method=HMAC-SHA1");
  });

  it("should encode parameters with empty values", () => {
    const result = encodeParams({ key: "" });
    expect(result).toBe("key=");
  });

  it("should encode RFC 3986 special characters in values", () => {
    const result = encodeParams({ test: "!*'()" });
    expect(result).toBe("test=%21%2A%27%28%29");
  });

  it("should encode ampersand in key and value", () => {
    const result = encodeParams({ "key&name": "value&data" });
    expect(result).toBe("key%26name=value%26data");
  });

  it("should encode equals sign in value", () => {
    const result = encodeParams({ equation: "a=b" });
    expect(result).toBe("equation=a%3Db");
  });

  it("should encode multiple parameters with special characters", () => {
    const result = encodeParams({
      query: "hello world",
      filter: "type=food&category=fruit",
    });
    expect(result).toBe(
      "query=hello%20world&filter=type%3Dfood%26category%3Dfruit"
    );
  });

  it("should encode unicode characters in params", () => {
    // e with acute accent (caf\u00e9)
    const result = encodeParams({ name: "caf\u00e9" });
    expect(result).toBe("name=caf%C3%A9");
  });

  it("should encode numeric-like string values", () => {
    const result = encodeParams({ id: "12345", amount: "99.99" });
    expect(result).toBe("id=12345&amount=99.99");
  });

  it("should handle URL-like values", () => {
    const result = encodeParams({
      callback: "https://example.com/callback?token=abc",
    });
    expect(result).toBe(
      "callback=https%3A%2F%2Fexample.com%2Fcallback%3Ftoken%3Dabc"
    );
  });

  it("should handle newlines and tabs in values", () => {
    const result = encodeParams({ text: "line1\nline2" });
    expect(result).toBe("text=line1%0Aline2");
  });

  it("should maintain parameter order from object keys", () => {
    // Note: Object key order is preserved in modern JS for string keys
    const result = encodeParams({ a: "1", b: "2", c: "3" });
    expect(result).toBe("a=1&b=2&c=3");
  });
});
