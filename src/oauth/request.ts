import fetch from "node-fetch";
import querystring from "querystring";
import { z } from "zod";
import { buildOAuthParams, generateSignature } from "./signature.js";
import { encodeParams } from "../utils/encoding.js";
import { ApiValidationError, ApiErrorSchema, FatSecretApiError } from "../schemas/index.js";
import type { FatSecretConfig, HttpMethod, FetchOptions } from "../types.js";

const BASE_URL = "https://platform.fatsecret.com/rest/server.api";

/**
 * Checks if the response is an API error and throws FatSecretApiError if so.
 */
function checkForApiError(data: unknown): void {
  const errorResult = ApiErrorSchema.safeParse(data);
  if (errorResult.success) {
    throw new FatSecretApiError(
      errorResult.data.error.code,
      errorResult.data.error.message
    );
  }
}

/**
 * Validates response data against a Zod schema.
 * Throws ApiValidationError with detailed information on failure.
 */
function validateResponse<T>(
  schema: z.ZodType<T>,
  data: unknown
): T {
  // First check if response is an API error
  checkForApiError(data);

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiValidationError(result.error, data);
  }
  return result.data;
}

/**
 * Internal options for OAuth request execution
 */
interface ExecuteRequestOptions {
  method: HttpMethod;
  url: string;
  params: Record<string, string>;
  config: FatSecretConfig;
  token?: string;
  tokenSecret?: string;
  errorPrefix: string;
}

/**
 * Internal function to execute OAuth 1.0 authenticated requests.
 * Used by both makeOAuthRequest and makeApiRequest.
 */
async function executeRequest<T>(
  options: ExecuteRequestOptions,
  schema: z.ZodType<T>
): Promise<T> {
  const { method, url, params, config, token, tokenSecret, errorPrefix } = options;

  const oauthParams = buildOAuthParams(config.clientId, token);
  const allParams: Record<string, string> = { ...params, ...oauthParams };

  const signature = generateSignature(
    method,
    url,
    allParams,
    config.clientSecret,
    tokenSecret
  );
  allParams.oauth_signature = signature;

  const fetchOptions: FetchOptions = {
    method,
    headers: {},
  };

  let requestUrl = url;
  if (method === "GET") {
    requestUrl += "?" + encodeParams(allParams);
  } else {
    fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
    fetchOptions.body = encodeParams(allParams);
  }

  const response = await fetch(requestUrl, fetchOptions);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${response.status} - ${text}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = querystring.parse(text);
  }

  return validateResponse(schema, data);
}

/**
 * Make an OAuth 1.0 authenticated request
 */
export async function makeOAuthRequest<T>(
  method: HttpMethod,
  url: string,
  params: Record<string, string>,
  config: FatSecretConfig,
  token: string | undefined,
  tokenSecret: string | undefined,
  schema: z.ZodType<T>
): Promise<T> {
  return executeRequest(
    { method, url, params, config, token, tokenSecret, errorPrefix: "OAuth error" },
    schema
  );
}

/**
 * Make an API request to FatSecret
 */
export async function makeApiRequest<T>(
  method: HttpMethod,
  params: Record<string, string>,
  config: FatSecretConfig,
  useAccessToken: boolean,
  schema: z.ZodType<T>
): Promise<T> {
  return executeRequest(
    {
      method,
      url: BASE_URL,
      params: { ...params, format: "json" },
      config,
      token: useAccessToken ? config.accessToken : undefined,
      tokenSecret: useAccessToken ? config.accessTokenSecret : undefined,
      errorPrefix: "FatSecret API error",
    },
    schema
  );
}
