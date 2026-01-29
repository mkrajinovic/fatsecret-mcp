import { makeApiRequest } from "../oauth/request.js";
import { requireAuth } from "../utils/validation.js";
import {
  ProfileResponseSchema,
  type ProfileResponseParsed,
} from "../schemas/index.js";
import type { FatSecretConfig } from "../types.js";

/**
 * Get the authenticated user's profile
 */
export async function getProfile(
  config: FatSecretConfig
): Promise<ProfileResponseParsed> {
  requireAuth(config);

  return makeApiRequest(
    "GET",
    { method: "profile.get" },
    config,
    true,
    ProfileResponseSchema
  );
}
