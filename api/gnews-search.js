/**
 * Same-origin proxy for GNews search.
 * Browser calls `/api/gnews-search` (Vercel function), preventing CORS failures.
 */
export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    const key = String(process.env.VITE_GNEWS_API_KEY ?? "").trim();
    if (!key) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          error: "Missing VITE_GNEWS_API_KEY in deployment environment variables.",
        }),
      );
      return;
    }

    const fullUrl = new URL(req.url || "/api/gnews-search", "https://proxy.local");
    const max = Math.min(
      100,
      Math.max(1, Number.parseInt(fullUrl.searchParams.get("max") || "10", 10) || 10),
    );
    const q = (fullUrl.searchParams.get("q") || "Formula 1").trim() || "Formula 1";
    const lang = (fullUrl.searchParams.get("lang") || "en").trim() || "en";

    const params = new URLSearchParams({
      q,
      lang,
      max: String(max),
      apikey: key,
    });

    const upstream = await fetch(`https://gnews.io/api/v4/search?${params.toString()}`);
    const body = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json; charset=utf-8",
    );
    res.end(body);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "gnews-search invocation failed",
        detail: String(err?.stack || err?.message || err),
      }),
    );
  }
}
