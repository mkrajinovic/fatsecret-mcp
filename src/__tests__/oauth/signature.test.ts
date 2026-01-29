import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createSignatureBaseString,
  createSigningKey,
  generateSignature,
  generateNonce,
  generateTimestamp,
  buildOAuthParams,
} from "../../oauth/signature.js";

describe("createSignatureBaseString", () => {
  it("should sort params and encode per OAuth 1.0 spec", () => {
    const result = createSignatureBaseString(
      "GET",
      "https://api.example.com/resource",
      { z: "3", a: "1", m: "2" }
    );

    expect(result).toBe(
      "GET&https%3A%2F%2Fapi.example.com%2Fresource&a%3D1%26m%3D2%26z%3D3"
    );
  });

  it("should handle POST method", () => {
    const result = createSignatureBaseString(
      "POST",
      "https://api.example.com/resource",
      { param: "value" }
    );

    expect(result).toContain("POST&");
  });

  it("should handle lowercase method by converting to uppercase", () => {
    const result = createSignatureBaseString(
      "get",
      "https://api.example.com/resource",
      { param: "value" }
    );

    expect(result).toContain("GET&");
  });

  it("should encode special characters in params", () => {
    const result = createSignatureBaseString(
      "GET",
      "https://api.example.com",
      { "test!": "value*" }
    );

    // Parameters are percent-encoded, then the entire string is percent-encoded again
    // So ! becomes %21 then %2521, and * becomes %2A then %252A
    expect(result).toContain("test%2521%3Dvalue%252A");
  });

  it("should handle empty params", () => {
    const result = createSignatureBaseString(
      "GET",
      "https://api.example.com",
      {}
    );

    expect(result).toBe("GET&https%3A%2F%2Fapi.example.com&");
  });

  it("should handle OAuth-style parameters", () => {
    const result = createSignatureBaseString(
      "GET",
      "https://api.example.com/resource",
      {
        oauth_consumer_key: "key123",
        oauth_nonce: "nonce123",
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: "1234567890",
        oauth_version: "1.0",
      }
    );

    expect(result).toContain("oauth_consumer_key%3Dkey123");
    expect(result).toContain("oauth_nonce%3Dnonce123");
  });
});

describe("createSigningKey", () => {
  it("should create key with client secret and empty token secret", () => {
    const result = createSigningKey("clientSecret123", "");
    expect(result).toBe("clientSecret123&");
  });

  it("should create key with client secret and token secret", () => {
    const result = createSigningKey("clientSecret", "tokenSecret");
    expect(result).toBe("clientSecret&tokenSecret");
  });

  it("should create key with default empty token secret", () => {
    const result = createSigningKey("clientSecret");
    expect(result).toBe("clientSecret&");
  });

  it("should encode special characters in secrets", () => {
    const result = createSigningKey("client&secret", "token&secret");
    expect(result).toBe("client%26secret&token%26secret");
  });

  it("should handle empty client secret", () => {
    const result = createSigningKey("", "tokenSecret");
    expect(result).toBe("&tokenSecret");
  });

  it("should handle RFC 3986 special characters", () => {
    const result = createSigningKey("secret!'()*", "token!'()*");
    expect(result).toBe("secret%21%27%28%29%2A&token%21%27%28%29%2A");
  });
});

describe("generateSignature", () => {
  it("should generate valid HMAC-SHA1 signature", () => {
    const signature = generateSignature(
      "GET",
      "https://api.example.com/resource",
      { param: "value" },
      "clientSecret",
      "tokenSecret"
    );

    // Signature should be base64 encoded
    expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("should generate consistent signature for same inputs", () => {
    const params = { a: "1", b: "2" };
    const sig1 = generateSignature("GET", "https://api.example.com", params, "secret", "token");
    const sig2 = generateSignature("GET", "https://api.example.com", params, "secret", "token");

    expect(sig1).toBe(sig2);
  });

  it("should generate different signatures for different params", () => {
    const sig1 = generateSignature("GET", "https://api.example.com", { a: "1" }, "secret", "token");
    const sig2 = generateSignature("GET", "https://api.example.com", { a: "2" }, "secret", "token");

    expect(sig1).not.toBe(sig2);
  });

  it("should generate different signatures for different secrets", () => {
    const sig1 = generateSignature("GET", "https://api.example.com", { a: "1" }, "secret1", "");
    const sig2 = generateSignature("GET", "https://api.example.com", { a: "1" }, "secret2", "");

    expect(sig1).not.toBe(sig2);
  });

  it("should work without token secret", () => {
    const signature = generateSignature(
      "GET",
      "https://api.example.com",
      { param: "value" },
      "clientSecret"
    );

    expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("should generate different signatures for different methods", () => {
    const sig1 = generateSignature("GET", "https://api.example.com", { a: "1" }, "secret", "");
    const sig2 = generateSignature("POST", "https://api.example.com", { a: "1" }, "secret", "");

    expect(sig1).not.toBe(sig2);
  });
});

describe("generateNonce", () => {
  it("should generate 32-character hex string", () => {
    const nonce = generateNonce();

    expect(nonce).toHaveLength(32);
    expect(nonce).toMatch(/^[0-9a-f]+$/);
  });

  it("should generate unique values", () => {
    const nonces = new Set<string>();
    for (let i = 0; i < 100; i++) {
      nonces.add(generateNonce());
    }

    expect(nonces.size).toBe(100);
  });

  it("should only contain lowercase hex characters", () => {
    const nonce = generateNonce();
    expect(nonce).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe("generateTimestamp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return Unix timestamp as string", () => {
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    const timestamp = generateTimestamp();

    expect(timestamp).toBe("1705320000");
  });

  it("should return current time in seconds", () => {
    const now = 1700000000000; // milliseconds
    vi.setSystemTime(now);

    const timestamp = generateTimestamp();

    expect(timestamp).toBe("1700000000");
  });

  it("should floor fractional seconds", () => {
    vi.setSystemTime(1700000000999); // .999 seconds

    const timestamp = generateTimestamp();

    expect(timestamp).toBe("1700000000");
  });

  it("should return string type", () => {
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    const timestamp = generateTimestamp();

    expect(typeof timestamp).toBe("string");
  });
});

describe("buildOAuthParams", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should build basic OAuth params without token", () => {
    const params = buildOAuthParams("myClientId");

    expect(params.oauth_consumer_key).toBe("myClientId");
    expect(params.oauth_signature_method).toBe("HMAC-SHA1");
    expect(params.oauth_version).toBe("1.0");
    expect(params.oauth_timestamp).toBe("1705320000");
    expect(params.oauth_nonce).toHaveLength(32);
    expect(params.oauth_token).toBeUndefined();
  });

  it("should include token when provided", () => {
    const params = buildOAuthParams("myClientId", "myToken");

    expect(params.oauth_consumer_key).toBe("myClientId");
    expect(params.oauth_token).toBe("myToken");
  });

  it("should not include oauth_token when token is undefined", () => {
    const params = buildOAuthParams("myClientId", undefined);

    expect(params).not.toHaveProperty("oauth_token");
  });

  it("should not include oauth_token when token is empty string", () => {
    const params = buildOAuthParams("myClientId", "");

    expect(params).not.toHaveProperty("oauth_token");
  });

  it("should generate unique nonce for each call", () => {
    const params1 = buildOAuthParams("clientId");
    const params2 = buildOAuthParams("clientId");

    expect(params1.oauth_nonce).not.toBe(params2.oauth_nonce);
  });

  it("should have all required OAuth 1.0 fields", () => {
    const params = buildOAuthParams("clientId");

    const requiredFields = [
      "oauth_consumer_key",
      "oauth_nonce",
      "oauth_signature_method",
      "oauth_timestamp",
      "oauth_version",
    ];

    for (const field of requiredFields) {
      expect(params).toHaveProperty(field);
    }
  });
});

describe("OAuth 1.0 signature correctness", () => {
  // Test vectors based on OAuth 1.0 RFC 5849 and Twitter's documentation
  // These verify the signature algorithm produces correct results

  it("should generate correct signature for RFC 5849 example", () => {
    // Based on RFC 5849 Section 3.4.1.1 example (simplified)
    const params = {
      oauth_consumer_key: "dpf43f3p2l4k3l03",
      oauth_nonce: "kllo9940pd9333jh",
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: "1191242096",
      oauth_token: "nnch734d00sl2jdk",
      oauth_version: "1.0",
      size: "original",
      file: "vacation.jpg",
    };

    const baseString = createSignatureBaseString(
      "GET",
      "http://photos.example.net/photos",
      params
    );

    // Verify base string structure
    expect(baseString).toContain("GET&");
    expect(baseString).toContain("http%3A%2F%2Fphotos.example.net%2Fphotos&");

    // Generate signature
    const signature = generateSignature(
      "GET",
      "http://photos.example.net/photos",
      params,
      "kd94hf93k423kf44", // consumer secret
      "pfkkdhi9sl3r4s00"  // token secret
    );

    // Signature should be base64 encoded HMAC-SHA1
    expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);
    // Known correct signature for this test vector
    expect(signature).toBe("tR3+Ty81lMeYAr/Fid0kMTYa/WM=");
  });

  it("should generate correct signature without token secret", () => {
    // Test 2-legged OAuth (no user token)
    const params = {
      oauth_consumer_key: "test_key",
      oauth_nonce: "abc123",
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: "1234567890",
      oauth_version: "1.0",
      method: "foods.search",
      search_expression: "apple",
    };

    const signature = generateSignature(
      "GET",
      "https://platform.fatsecret.com/rest/server.api",
      params,
      "test_secret"
      // no token secret - defaults to empty string
    );

    // Verify it's a valid base64 string
    expect(signature).toMatch(/^[A-Za-z0-9+/]+=*$/);

    // Verify same inputs produce same signature (deterministic)
    const signature2 = generateSignature(
      "GET",
      "https://platform.fatsecret.com/rest/server.api",
      params,
      "test_secret"
    );
    expect(signature).toBe(signature2);
  });

  it("should handle special characters in OAuth flow correctly", () => {
    // Test that special characters are properly percent-encoded in signature
    const params = {
      oauth_consumer_key: "key",
      oauth_nonce: "nonce",
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: "1234567890",
      oauth_version: "1.0",
      search_expression: "cafe latte", // spaces and special chars
    };

    const signature1 = generateSignature(
      "GET",
      "https://api.example.com/search",
      params,
      "secret&key", // ampersand in secret
      "token&secret" // ampersand in token secret
    );

    // Different parameters should yield different signature
    const params2 = { ...params, search_expression: "espresso" };
    const signature2 = generateSignature(
      "GET",
      "https://api.example.com/search",
      params2,
      "secret&key",
      "token&secret"
    );

    expect(signature1).not.toBe(signature2);
    // Both should still be valid base64
    expect(signature1).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(signature2).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("should correctly create base string with sorted parameters", () => {
    const params = {
      z_param: "last",
      a_param: "first",
      m_param: "middle",
      oauth_consumer_key: "key",
    };

    const baseString = createSignatureBaseString(
      "POST",
      "https://api.example.com",
      params
    );

    // Parameters should be sorted alphabetically
    // a_param < m_param < oauth_consumer_key < z_param
    const paramsSection = baseString.split("&")[2];
    const decodedParams = decodeURIComponent(paramsSection);

    expect(decodedParams).toBe(
      "a_param=first&m_param=middle&oauth_consumer_key=key&z_param=last"
    );
  });

  it("should handle POST method in signature correctly", () => {
    const params = {
      oauth_consumer_key: "key",
      oauth_nonce: "nonce123",
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: "1234567890",
      oauth_version: "1.0",
    };

    const getSignature = generateSignature(
      "GET",
      "https://api.example.com/resource",
      params,
      "secret"
    );

    const postSignature = generateSignature(
      "POST",
      "https://api.example.com/resource",
      params,
      "secret"
    );

    // GET and POST should produce different signatures
    expect(getSignature).not.toBe(postSignature);
  });
});
