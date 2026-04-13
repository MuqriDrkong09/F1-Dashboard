/**
 * Encode a canonical article URL into a URL-safe path segment for `/news/article/:key`.
 */
export function encodeArticleRouteKey(url) {
  if (typeof url !== "string" || url.trim() === "") {
    throw new Error("Article URL is required for route encoding");
  }
  const utf8 = new TextEncoder().encode(url);
  let binary = "";
  utf8.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * @returns {string | null} decoded URL or null if invalid
 */
export function decodeArticleRouteKey(key) {
  if (typeof key !== "string" || key.trim() === "") return null;
  try {
    const pad = key.length % 4 === 0 ? "" : "=".repeat(4 - (key.length % 4));
    const b64 = key.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function articleDetailPath(url) {
  return `/news/article/${encodeArticleRouteKey(url)}`;
}
