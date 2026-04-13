import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import CountUpNumber from "../components/CountUpNumber";
import { DashboardSkeleton, NewsGridSkeleton } from "../components/ApiLoadingSkeletons";
import F1NewsArticleCard from "../components/F1NewsArticleCard";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import {
  getLatestDriverChampionship,
  getMeetingsByYear,
} from "../services/openf1";
import { searchFormulaOneNews } from "../services/gnews";

/** @typedef {{ label: string } & (
 *   | { kind: "text"; text: string }
 *   | { kind: "points"; points: number }
 *   | { kind: "driverNumber"; number: number }
 *   | { kind: "round"; round: number; total: number }
 *   | { kind: "days"; days: number }
 * )} StatCardModel */

function getCountdownParts(targetDate) {
  if (!targetDate) return { kind: "text", text: "TBD" };
  const diff = Date.parse(targetDate) - Date.now();
  if (!Number.isFinite(diff)) return { kind: "text", text: "TBD" };
  if (diff <= 0) return { kind: "text", text: "In progress" };
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return { kind: "days", days };
}

function StatValue({ card }) {
  const titleSx = { mt: 1, fontWeight: 700 };

  if (card.kind === "text") {
    return (
      <Typography variant="h6" sx={titleSx}>
        {card.text}
      </Typography>
    );
  }

  if (card.kind === "points") {
    return (
      <Typography variant="h6" component="div" sx={titleSx}>
        <CountUpNumber component="span" end={card.points} duration={1000} /> pts
      </Typography>
    );
  }

  if (card.kind === "driverNumber") {
    return (
      <Typography variant="h6" component="div" sx={titleSx}>
        #
        <CountUpNumber component="span" end={card.number} duration={1000} />
      </Typography>
    );
  }

  if (card.kind === "round") {
    return (
      <Typography variant="h6" component="div" sx={titleSx}>
        Round <CountUpNumber component="span" end={card.round} duration={1000} /> /{" "}
        {card.total}
      </Typography>
    );
  }

  if (card.kind === "days") {
    return (
      <Typography variant="h6" component="div" sx={titleSx}>
        <CountUpNumber component="span" end={card.days} duration={1000} />{" "}
        {card.days === 1 ? "day" : "days"}
      </Typography>
    );
  }

  return null;
}

export default function Dashboard() {
  /** @type {[StatCardModel[], function]} */
  const [statCards, setStatCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  const now = useMemo(() => Date.now(), []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        const year = new Date().getUTCFullYear();
        const [meetings, driverStandings] = await Promise.all([
          getMeetingsByYear(year, controller.signal),
          getLatestDriverChampionship(controller.signal),
        ]);

        const sortedMeetings = [...meetings].sort((a, b) =>
          (a.date_start ?? "").localeCompare(b.date_start ?? ""),
        );
        const nextMeeting =
          sortedMeetings.find(
            (meeting) =>
              Date.parse(meeting.date_end ?? meeting.date_start ?? "") >= now,
          ) ?? sortedMeetings[sortedMeetings.length - 1];

        const completedRounds = sortedMeetings.filter(
          (meeting) => Date.parse(meeting.date_end ?? meeting.date_start ?? "") < now,
        ).length;
        const totalRounds = sortedMeetings.length;

        const championshipLeader = [...driverStandings].sort(
          (a, b) =>
            Number(a.position_current ?? 999) - Number(b.position_current ?? 999),
        )[0];

        const countdown = getCountdownParts(nextMeeting?.date_start);

        /** @type {StatCardModel[]} */
        const cards = [
          {
            label: "Next Grand Prix",
            kind: "text",
            text: nextMeeting?.meeting_name ?? "TBD",
          },
          {
            label: "Circuit",
            kind: "text",
            text: nextMeeting?.circuit_short_name ?? "TBD",
          },
          {
            label: "Countdown",
            ...(countdown.kind === "days"
              ? { kind: "days", days: countdown.days }
              : { kind: "text", text: countdown.text }),
          },
          totalRounds > 0
            ? {
                label: "Season Progress",
                kind: "round",
                round: Math.min(completedRounds + 1, totalRounds),
                total: totalRounds,
              }
            : { label: "Season Progress", kind: "text", text: "TBD" },
          championshipLeader?.driver_number !== undefined
            ? {
                label: "Championship Leader",
                kind: "driverNumber",
                number: Number(championshipLeader.driver_number),
              }
            : { label: "Championship Leader", kind: "text", text: "TBD" },
          championshipLeader?.points_current !== undefined
            ? {
                label: "Leader Points",
                kind: "points",
                points: Number(championshipLeader.points_current),
              }
            : { label: "Leader Points", kind: "text", text: "TBD" },
        ];

        setStatCards(cards);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load dashboard metrics");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
    return () => controller.abort();
  }, [now]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadNews() {
      setNewsLoading(true);
      setNewsError(null);
      try {
        const items = await searchFormulaOneNews({ max: 5, signal: controller.signal });
        if (controller.signal.aborted) return;
        setNewsArticles(items);
      } catch (err) {
        if (err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setNewsError(err.message ?? "Could not load Formula 1 news");
        }
      } finally {
        if (!controller.signal.aborted) setNewsLoading(false);
      }
    }
    loadNews();
    return () => controller.abort();
  }, []);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "primary.main", letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}
          >
            F1 Dashboard
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
            Race Control Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Track season progress, latest standings, and upcoming sessions in one
            place.
          </Typography>
        </Box>

        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {statCards.map((card) => (
              <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: "background.paper",
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        color: "text.secondary",
                      }}
                    >
                      {card.label}
                    </Typography>
                    <StatValue card={card} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 6 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Latest F1 News
            </Typography>
            <Button component={RouterLink} to="/news" size="small" variant="outlined">
              View all
            </Button>
          </Stack>
          {newsLoading ? (
            <NewsGridSkeleton cards={5} />
          ) : newsError ? (
            <Alert severity="warning">{newsError}</Alert>
          ) : newsArticles.length === 0 ? (
            <Alert severity="info">No news articles returned.</Alert>
          ) : (
            <Grid container spacing={2}>
              {newsArticles.map((article) => (
                <Grid key={article.url} size={{ xs: 12, sm: 6, md: 4 }}>
                  <F1NewsArticleCard article={article} compact />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}
