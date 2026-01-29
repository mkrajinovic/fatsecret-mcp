import { z } from "zod";

export const OAuthTokenResponseSchema = z.strictObject({
  oauth_token: z.string(),
  oauth_token_secret: z.string(),
  oauth_callback_confirmed: z.string().optional(),
});

export const AccessTokenResponseSchema = z.strictObject({
  oauth_token: z.string(),
  oauth_token_secret: z.string(),
  user_id: z.string().optional(),
});

export type OAuthTokenResponseParsed = z.infer<typeof OAuthTokenResponseSchema>;
export type AccessTokenResponseParsed = z.infer<typeof AccessTokenResponseSchema>;
