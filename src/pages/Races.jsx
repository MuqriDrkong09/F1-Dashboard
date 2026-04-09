import { useEffect, useMemo, useState } from "react";
import RaceCard from "../components/RaceCard";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { getMeetingsByYear } from "../services/openf1";

export default function Races() {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMeetings() {
      try {
        setIsLoading(true);
        setError(null);

        const year = new Date().getUTCFullYear();
        const data = await getMeetingsByYear(year, controller.signal);
        setMeetings(data);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load race calendar");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeetings();
    return () => controller.abort();
  }, []);

  const upcomingRaces = useMemo(() => {
    const now = Date.now();
    const sorted = [...meetings].sort((a, b) =>
      (a.date_start ?? "").localeCompare(b.date_start ?? ""),
    );

    const upcoming = sorted.filter((meeting) => {
      const endDate = Date.parse(meeting.date_end ?? meeting.date_start ?? "");
      return Number.isFinite(endDate) && endDate >= now;
    });

    return (upcoming.length > 0 ? upcoming : sorted).map((meeting, index) => ({
      id: meeting.meeting_key ?? `${meeting.meeting_name}-${index}`,
      meetingKey: meeting.meeting_key,
      round: index + 1,
      raceName: meeting.meeting_name ?? "Unknown Grand Prix",
      circuit: meeting.circuit_short_name ?? "Unknown Circuit",
      country: meeting.country_name ?? "Unknown Country",
      date: meeting.date_start
        ? new Date(meeting.date_start).toLocaleDateString()
        : "TBD",
    }));
  }, [meetings]);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Race Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Upcoming race weekends with quick circuit details.
          </Typography>
        </Box>

        {isLoading ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
            <Typography color="text.secondary">Loading race calendar...</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            {upcomingRaces.map((race) => (
              <Box key={race.id}>
                <RaceCard
                  raceName={`Round ${race.round}: ${race.raceName}`}
                  circuit={race.circuit}
                  country={race.country}
                  date={race.date}
                  meetingKey={race.meetingKey}
                />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
