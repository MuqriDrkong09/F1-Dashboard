import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { NewsGridSkeleton } from "../components/ApiLoadingSkeletons";
import F1NewsArticleCard from "../components/F1NewsArticleCard";
import { searchFormulaOneNews } from "../services/gnews";

export default function News() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchFormulaOneNews({ max: 20, signal });
      if (signal?.aborted) return;
      setArticles(data);
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!signal?.aborted) setError(err.message ?? "Failed to load news");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "primary.main", letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}
          >
            News
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
            Formula 1 headlines
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Articles from GNews search (English, &quot;Formula 1&quot;). Open any card for a full in-app
            view, source link, and related stories.
          </Typography>
        </Box>

        {isLoading ? (
          <NewsGridSkeleton cards={9} />
        ) : error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => load()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : articles.length === 0 ? (
          <Alert severity="info">No articles returned for this query.</Alert>
        ) : (
          <Grid container spacing={2}>
            {articles.map((article) => (
              <Grid key={article.url} size={{ xs: 12, sm: 6, md: 4 }}>
                <F1NewsArticleCard article={article} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
