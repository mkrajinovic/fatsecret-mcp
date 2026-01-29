/**
 * Percent-encode a string per RFC 3986
 */
export function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

/**
 * Encode parameters for URL query string or POST body
 */
export function encodeParams(params: Record<string, string>): string {
  return Object.keys(params)
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");
}
