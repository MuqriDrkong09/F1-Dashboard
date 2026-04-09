import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import { DashboardSkeleton } from "../components/ApiLoadingSkeletons";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  getLatestDriverChampionship,
  getMeetingsByYear,
} from "../services/openf1";

export default function Dashboard() {
  const [statCards, setStatCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = useMemo(() => Date.now(), []);

  useEffect(() => {
    const controller = new AbortController();

    function getCountdown(targetDate) {
      if (!targetDate) return "TBD";
      const diff = Date.parse(targetDate) - Date.now();
      if (!Number.isFinite(diff)) return "TBD";
      if (diff <= 0) return "In progress";
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return `${days} day${days === 1 ? "" : "s"}`;
    }

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

        setStatCards([
          {
            label: "Next Grand Prix",
            value: nextMeeting?.meeting_name ?? "TBD",
          },
          {
            label: "Circuit",
            value: nextMeeting?.circuit_short_name ?? "TBD",
          },
          {
            label: "Countdown",
            value: getCountdown(nextMeeting?.date_start),
          },
          {
            label: "Season Progress",
            value:
              totalRounds > 0
                ? `Round ${Math.min(completedRounds + 1, totalRounds)} / ${totalRounds}`
                : "TBD",
          },
          {
            label: "Championship Leader",
            value:
              championshipLeader?.driver_number !== undefined
                ? `#${championshipLeader.driver_number}`
                : "TBD",
          },
          {
            label: "Leader Points",
            value:
              championshipLeader?.points_current !== undefined
                ? `${championshipLeader.points_current} pts`
                : "TBD",
          },
        ]);
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
          <Alert severity="error">{error}</Alert>
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
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
