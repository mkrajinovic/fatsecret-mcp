import crypto from "crypto";
import { percentEncode } from "../utils/encoding.js";

/**
 * Create OAuth signature base string per OAuth 1.0 spec
 */
export function createSignatureBaseString(
  method: string,
  url: string,
  parameters: Record<string, string>
): string {
  const sortedParams = Object.keys(parameters)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(parameters[key])}`)
    .join("&");

  return [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams),
  ].join("&");
}

/**
 * Create OAuth signing key
 */
export function createSigningKey(
  clientSecret: string,
  tokenSecret: string = ""
): string {
  return `${percentEncode(clientSecret)}&${percentEncode(tokenSecret)}`;
}

/**
 * Generate HMAC-SHA1 OAuth signature
 */
export function generateSignature(
  method: string,
  url: string,
  parameters: Record<string, string>,
  clientSecret: string,
  tokenSecret: string = ""
): string {
  const baseString = createSignatureBaseString(method, url, parameters);
  const signingKey = createSigningKey(clientSecret, tokenSecret);

  return crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");
}

/**
 * Generate cryptographic nonce
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Generate OAuth timestamp (seconds since epoch)
 */
export function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

/**
 * Build OAuth parameters object
 */
export function buildOAuthParams(
  clientId: string,
  token?: string
): Record<string, string> {
  const params: Record<string, string> = {
    oauth_consumer_key: clientId,
    oauth_nonce: generateNonce(),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: generateTimestamp(),
    oauth_version: "1.0",
  };

  if (token) {
    params.oauth_token = token;
  }

  return params;
}
