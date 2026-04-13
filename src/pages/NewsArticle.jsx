import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import OpenInNew from "@mui/icons-material/OpenInNew";
import { Link as RouterLink, useParams } from "react-router-dom";
import { NewsArticleSkeleton } from "../components/ApiLoadingSkeletons";
import F1NewsArticleCard from "../components/F1NewsArticleCard";
import { searchFormulaOneNews } from "../services/gnews";
import { decodeArticleRouteKey } from "../utils/articleRouteKey";

function htmlToPlainText(html) {
  if (!html || typeof html !== "string") return "";
  try {
    const el = document.createElement("div");
    el.innerHTML = html;
    const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return text;
  } catch {
    return "";
  }
}

function formatNewsDate(iso) {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(t);
}

export default function NewsArticle() {
  const { articleKey } = useParams();
  const canonicalUrl = useMemo(
    () => (articleKey ? decodeArticleRouteKey(articleKey) : null),
    [articleKey],
  );

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const resolve = useCallback(
    async (signal) => {
      if (!canonicalUrl) {
        setNotFound(Boolean(articleKey));
        setArticle(null);
        setRelated([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setNotFound(false);
      setArticle(null);
      setRelated([]);

      try {
        const list = await searchFormulaOneNews({ max: 100, signal });
        if (signal?.aborted) return;
        const hit = list.find((a) => a.url === canonicalUrl);
        if (!hit) {
          setNotFound(true);
          return;
        }
        setArticle(hit);
        setRelated(list.filter((a) => a.url !== hit.url).slice(0, 6));
      } catch (err) {
        if (err.name === "AbortError") return;
        if (!signal?.aborted) setError(err.message ?? "Failed to load article");
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [articleKey, canonicalUrl],
  );

  useEffect(() => {
    const controller = new AbortController();
    resolve(controller.signal);
    return () => controller.abort();
  }, [resolve]);

  const bodyText = article
    ? htmlToPlainText(article.content) || article.description || ""
    : "";

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Button component={RouterLink} to="/news" variant="text" sx={{ mb: 2 }}>
          ← All F1 news
        </Button>

        {!canonicalUrl || notFound ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {!canonicalUrl
              ? "This article link is invalid."
              : "This article is not in the current GNews results (it may have aged out of the index)."}
            {canonicalUrl ? (
              <Box sx={{ mt: 1 }}>
                <Link href={canonicalUrl} target="_blank" rel="noopener noreferrer" underline="hover">
                  Open original in a new tab
                </Link>
              </Box>
            ) : null}
          </Alert>
        ) : null}

        {isLoading ? (
          <NewsArticleSkeleton />
        ) : error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => resolve()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : article ? (
          <Stack spacing={3}>
            {article.image ? (
              <Box
                component="img"
                src={article.image}
                alt=""
                sx={{
                  width: "100%",
                  maxHeight: 360,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              />
            ) : null}

            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {article.title}
              </Typography>
              <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                {article.sourceName ? (
                  <Typography variant="body2" color="text.secondary">
                    {article.sourceName}
                  </Typography>
                ) : null}
                {article.publishedAt ? (
                  <Typography variant="body2" color="text.secondary">
                    {formatNewsDate(article.publishedAt)}
                  </Typography>
                ) : null}
              </Stack>
            </Box>

            <Button
              component="a"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              endIcon={<OpenInNew />}
            >
              Read original
            </Button>

            {bodyText ? (
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                {bodyText}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No preview text available. Use &quot;Read original&quot; for the full story.
              </Typography>
            )}

            {related.length > 0 ? (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Related articles
                </Typography>
                <Grid container spacing={2}>
                  {related.map((a) => (
                    <Grid key={a.url} size={{ xs: 12, sm: 6 }}>
                      <F1NewsArticleCard article={a} compact />
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : null}
          </Stack>
        ) : null}
      </Container>
    </Box>
  );
}
