import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Dev-only middleware that mirrors `/api/gnews-search` behavior from Vercel.
 * Keeps client requests same-origin and avoids browser CORS issues.
 */
function gnewsSearchProxyPlugin(apiKey) {
  return {
    name: "gnews-search-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathOnly = (req.url ?? "").split("?")[0];
        if (pathOnly !== "/api/gnews-search") {
          next();
          return;
        }

        void (async () => {
          const key = (apiKey ?? "").trim();
          if (!key) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                error:
                  "Missing VITE_GNEWS_API_KEY in .env for local /api/gnews-search proxy.",
              }),
            );
            return;
          }

          try {
            const fullUrl = new URL(req.url ?? "/api/gnews-search", "http://dev.local");
            const max = Math.min(
              100,
              Math.max(
                1,
                Number.parseInt(fullUrl.searchParams.get("max") || "10", 10) || 10,
              ),
            );
            const q = (fullUrl.searchParams.get("q") || "Formula 1").trim() || "Formula 1";
            const lang = (fullUrl.searchParams.get("lang") || "en").trim() || "en";
            const params = new URLSearchParams({
              q,
              lang,
              max: String(max),
              apikey: key,
            });

            const upstream = await fetch(
              `https://gnews.io/api/v4/search?${params.toString()}`,
            );
            const body = await upstream.text();
            res.statusCode = upstream.status;
            res.setHeader(
              "Content-Type",
              upstream.headers.get("content-type") || "application/json; charset=utf-8",
            );
            res.end(body);
          } catch (err) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: String(err?.message ?? err) }));
          }
        })();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), gnewsSearchProxyPlugin(env.VITE_GNEWS_API_KEY ?? "")],
    server: {
      // Open Dashboard on first dev start (matches in-app `/` → `/dashboard` redirect).
      open: "/dashboard",
    },
  };
});
