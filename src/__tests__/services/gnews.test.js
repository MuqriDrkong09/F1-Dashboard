import { normalizeGNewsArticle, searchFormulaOneNews } from "../../services/gnews";

describe("gnews service", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("normalizes a raw article", () => {
    const row = normalizeGNewsArticle({
      title: "T",
      description: "D",
      content: "C",
      url: "https://a.test/x",
      image: "https://a.test/i.jpg",
      publishedAt: "2025-01-01T00:00:00Z",
      source: { name: "SRC", url: "https://src.test" },
    });
    expect(row).toMatchObject({
      title: "T",
      url: "https://a.test/x",
      sourceName: "SRC",
    });
  });

  it("returns null when url missing", () => {
    expect(normalizeGNewsArticle({ title: "x" })).toBeNull();
  });

  it("parses search response", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        articles: [{ title: "A", url: "https://u.test/1", description: "", content: "" }],
      }),
    });

    const out = await searchFormulaOneNews({ max: 5 });
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe("A");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://gnews.io/api/v4/search?"),
      expect.any(Object),
    );
    const u = String(fetch.mock.calls[0][0]);
    expect(u).toContain("q=Formula+1");
    expect(u).toContain("lang=en");
    expect(u).toContain("max=5");
    expect(u).toContain("apikey=");
  });

  it("throws on non-ok response", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    });

    await expect(searchFormulaOneNews({ max: 3 })).rejects.toThrow(/GNews request failed \(401\)/);
  });
});
