/** Default base used when constructing internal URLs. */
export const DEFAULT_INTERNAL_BASE = 'http://internal';

/** Key → string or array of strings (for repeated query params). */
export type QueryMap = Record<string, string | string[]>;

/**
 * Build a URL from a string path or an existing URL.
 * Never reads Node.js request types; pure and platform-agnostic.
 */
export function buildURL(input: string | URL, base: string = DEFAULT_INTERNAL_BASE): URL {
  if (input instanceof URL) return input;
  const path = input || '/';
  return new URL(path, base);
}

/** Convert URLSearchParams into a multi-value map. */
export function toQuery(u: URL): QueryMap {
  const out: QueryMap = {};
  u.searchParams.forEach((value, key) => {
    if (key in out) {
      const prev = out[key];
      out[key] = Array.isArray(prev) ? [...prev, value] : [prev as string, value];
    } else {
      out[key] = value;
    }
  });
  return out;
}
