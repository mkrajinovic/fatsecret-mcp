import { makeOAuthRequest } from "../oauth/request.js";
import {
  OAuthTokenResponseSchema,
  AccessTokenResponseSchema,
  type OAuthTokenResponseParsed,
  type AccessTokenResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig } from "../types.js";

const REQUEST_TOKEN_URL = "https://authentication.fatsecret.com/oauth/request_token";
const ACCESS_TOKEN_URL = "https://authentication.fatsecret.com/oauth/access_token";
export const AUTHORIZE_URL = "https://authentication.fatsecret.com/oauth/authorize";

/**
 * Get OAuth request token to start the authentication flow
 */
export async function getRequestToken(
  config: FatSecretConfig,
  callbackUrl: string = "oob"
): Promise<OAuthTokenResponseParsed> {
  return makeOAuthRequest(
    "POST",
    REQUEST_TOKEN_URL,
    { oauth_callback: callbackUrl },
    config,
    undefined,
    undefined,
    OAuthTokenResponseSchema
  );
}

/**
 * Exchange request token and verifier for access token
 */
export async function getAccessToken(
  config: FatSecretConfig,
  requestToken: string,
  requestTokenSecret: string,
  verifier: string
): Promise<AccessTokenResponseParsed> {
  return makeOAuthRequest(
    "GET",
    ACCESS_TOKEN_URL,
    { oauth_verifier: verifier },
    config,
    requestToken,
    requestTokenSecret,
    AccessTokenResponseSchema
  );
}
