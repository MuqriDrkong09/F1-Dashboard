import {
  articleDetailPath,
  decodeArticleRouteKey,
  encodeArticleRouteKey,
} from "../../utils/articleRouteKey";

describe("articleRouteKey", () => {
  it("round-trips a typical article URL", () => {
    const url = "https://example.com/f1/2025/article?x=1";
    const key = encodeArticleRouteKey(url);
    expect(decodeArticleRouteKey(key)).toBe(url);
    expect(articleDetailPath(url)).toBe(`/news/article/${key}`);
  });

  it("returns null for invalid keys", () => {
    expect(decodeArticleRouteKey("not!!!")).toBeNull();
    expect(decodeArticleRouteKey("")).toBeNull();
  });

  it("throws when encoding empty URL", () => {
    expect(() => encodeArticleRouteKey("")).toThrow(/required/);
  });
});
