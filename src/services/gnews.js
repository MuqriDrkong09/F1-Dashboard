/** Same-origin proxy endpoint (Vercel serverless / Vite dev middleware). */
const GNEWS_SEARCH_PROXY = "/api/gnews-search";

/** GNews blocks bursts; space requests and retry 429 with backoff. */
const GNEWS_MIN_GAP_MS = 1000;

let gnewsRequestQueue = Promise.resolve();
let nextGnewsRequestStartTime = 0;

function enqueueGNewsTask(task) {
  const run = gnewsRequestQueue.then(() => task());
  gnewsRequestQueue = run.then(
    () => {},
    () => {},
  );
  return run;
}

function delay(ms, signal) {
  if (signal?.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * GET the search URL with global pacing and 429 retries (GNews free tier is strict).
 */
async function fetchGNewsSearch(url, signal) {
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await enqueueGNewsTask(async () => {
      const now = Date.now();
      const waitMs = Math.max(0, nextGnewsRequestStartTime - now);
      if (waitMs > 0) {
        await delay(waitMs, signal);
      }
      nextGnewsRequestStartTime = Date.now() + GNEWS_MIN_GAP_MS;

      return fetch(url, { signal });
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status === 429 && attempt < maxAttempts - 1) {
      try {
        await response.text();
      } catch {
        /* ignore */
      }
      const baseMs = Math.min(2000 * 2 ** attempt, 16000);
      const jitterMs = Math.floor(Math.random() * 500);
      await delay(baseMs + jitterMs, signal);
      continue;
    }

    let detail = "";
    try {
      const t = await response.text();
      if (t) detail = `: ${t.slice(0, 200)}`;
    } catch {
      /* ignore */
    }
    throw new Error(`GNews request failed (${response.status})${detail}`);
  }

  throw new Error("GNews: rate limited after retries");
}

function buildGnewsSearchProxyUrl(max) {
  const n = Math.min(100, Math.max(1, Math.floor(Number(max)) || 10));
  const params = new URLSearchParams({
    q: "Formula 1",
    lang: "en",
    max: String(n),
  });
  return `${GNEWS_SEARCH_PROXY}?${params.toString()}`;
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
 * Uses same-origin `/api/gnews-search` so browser avoids CORS to `gnews.io`.
 *
 * @param {{ max?: number; signal?: AbortSignal }} [options]
 */
export async function searchFormulaOneNews(options = {}) {
  const { max = 10, signal } = options;
  const url = buildGnewsSearchProxyUrl(max);
  const json = await fetchGNewsSearch(url, signal);
  const list = Array.isArray(json.articles) ? json.articles : [];
  return list.map(normalizeGNewsArticle).filter(Boolean);
}
