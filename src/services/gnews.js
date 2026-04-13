const GNEWS_SEARCH = "https://gnews.io/api/v4/search";

function getGnewsApiKey() {
  const k = process.env.VITE_GNEWS_API_KEY;
  return typeof k === "string" ? k.trim() : "";
}

/** @param {unknown} raw */
export function normalizeGNewsArticle(raw) {
  if (!raw || typeof raw !== "object") return null;
  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  if (!url) return null;
  const source = raw.source && typeof raw.source === "object" ? raw.source : {};
  return {
    title: typeof raw.title === "string" ? raw.title : "Untitled",
    description: typeof raw.description === "string" ? raw.description : "",
    content: typeof raw.content === "string" ? raw.content : "",
    url,
    image: typeof raw.image === "string" && raw.image.trim() !== "" ? raw.image : null,
    publishedAt: typeof raw.publishedAt === "string" ? raw.publishedAt : null,
    sourceName: typeof source.name === "string" ? source.name : "",
    sourceUrl: typeof source.url === "string" && source.url.trim() !== "" ? source.url : null,
  };
}

/**
 * Formula 1 articles via GNews search (`q=Formula 1`, `lang=en`).
 * Uses the `apikey` query parameter per GNews API v4 docs.
 *
 * @param {{ max?: number; signal?: AbortSignal }} [options]
 */
export async function searchFormulaOneNews(options = {}) {
  const { max = 10, signal } = options;
  const apiKey = getGnewsApiKey();
  if (!apiKey) {
    throw new Error(
      "GNews API key missing. Add VITE_GNEWS_API_KEY to a .env file in the project root (see .env.example).",
    );
  }

  const n = Math.min(100, Math.max(1, Math.floor(Number(max)) || 10));
  const params = new URLSearchParams({
    q: "Formula 1",
    lang: "en",
    max: String(n),
    apikey: apiKey,
  });

  const response = await fetch(`${GNEWS_SEARCH}?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    let detail = "";
    try {
      const t = await response.text();
      if (t) detail = `: ${t.slice(0, 160)}`;
    } catch {
      /* ignore */
    }
    throw new Error(`GNews request failed (${response.status})${detail}`);
  }

  const json = await response.json();
  const list = Array.isArray(json.articles) ? json.articles : [];
  return list.map(normalizeGNewsArticle).filter(Boolean);
}
