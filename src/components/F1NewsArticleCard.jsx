import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { articleDetailPath } from "../utils/articleRouteKey";

function formatNewsDate(iso) {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(t);
}

/**
 * @param {{ article: { title: string; description: string; url: string; image: string | null; publishedAt: string | null; sourceName: string }; compact?: boolean }} props
 */
export default function F1NewsArticleCard({ article, compact = false }) {
  const to = articleDetailPath(article.url);
  const when = formatNewsDate(article.publishedAt);
  const mediaHeight = compact ? 120 : 160;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        bgcolor: "background.paper",
        borderColor: "divider",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none", boxShadow: 1 },
        },
      }}
    >
      <CardActionArea component={RouterLink} to={to} sx={{ alignItems: "stretch", height: "100%" }}>
        {article.image ? (
          <CardMedia
            component="img"
            height={mediaHeight}
            image={article.image}
            alt=""
            sx={{ objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <CardMedia
            component="div"
            sx={{
              height: mediaHeight,
              bgcolor: "action.hover",
              backgroundImage:
                "linear-gradient(135deg, rgba(206,17,65,0.12) 0%, rgba(21,21,30,0.08) 100%)",
            }}
          />
        )}
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{ fontWeight: 700, lineHeight: 1.35, mb: 0.5 }}
          >
            {article.title}
          </Typography>
          {article.sourceName ? (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              {article.sourceName}
              {when ? ` · ${when}` : ""}
            </Typography>
          ) : when ? (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              {when}
            </Typography>
          ) : null}
          {article.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: compact ? 2 : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {article.description}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
