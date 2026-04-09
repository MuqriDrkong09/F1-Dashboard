import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import { CountdownSkeleton } from "../components/ApiLoadingSkeletons";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/material/styles";
import {
  getMeetingsByYear,
  getSessionsByMeeting,
} from "../services/openf1";

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;
const MS_FIVE_MIN = 5 * 60 * 1000;

const countdownPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.82;
    transform: scale(1.03);
  }
`;

function formatDuration(ms) {
  if (ms <= 0) return "Starting now";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/** calm = green (>24h), soon = amber (1h–24h), urgent = red (<1h), live = session imminently started */
function getCountdownUrgency(remainingMs) {
  if (remainingMs == null) return "calm";
  if (remainingMs <= 0) return "live";
  if (remainingMs > MS_DAY) return "calm";
  if (remainingMs > MS_HOUR) return "soon";
  return "urgent";
}

export default function CountdownTimer() {
  const [target, setTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNextSession() {
      try {
        setIsLoading(true);
        setError(null);

        const year = new Date().getUTCFullYear();
        const meetings = await getMeetingsByYear(year, controller.signal);
        const sortedMeetings = [...meetings].sort((a, b) =>
          (a.date_start ?? "").localeCompare(b.date_start ?? ""),
        );

        const nextMeeting = sortedMeetings.find(
          (meeting) =>
            Date.parse(meeting.date_end ?? meeting.date_start ?? "") >=
            Date.now(),
        );

        if (!nextMeeting?.meeting_key) {
          throw new Error("No upcoming meeting found");
        }

        const sessions = await getSessionsByMeeting(
          nextMeeting.meeting_key,
          controller.signal,
        );

        const sortedSessions = [...sessions].sort((a, b) =>
          (a.date_start ?? "").localeCompare(b.date_start ?? ""),
        );

        const nextSession =
          sortedSessions.find(
            (session) => Date.parse(session.date_start ?? "") >= Date.now(),
          ) ?? sortedSessions[0];

        if (!nextSession?.date_start) {
          throw new Error("No session start time available for next meeting");
        }

        setTarget({
          meetingName: nextMeeting.meeting_name ?? "Unknown Grand Prix",
          circuit: nextMeeting.circuit_short_name ?? "Unknown Circuit",
          country: nextMeeting.country_name ?? "Unknown Country",
          sessionName: nextSession.session_name ?? "Session",
          startTime: nextSession.date_start,
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load countdown data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNextSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = useMemo(() => {
    if (!target?.startTime) return null;
    return Date.parse(target.startTime) - now;
  }, [target, now]);

  const urgency = getCountdownUrgency(remaining);
  const shouldPulse =
    remaining != null && remaining > 0 && remaining <= MS_FIVE_MIN;

  const urgencyStyles = useMemo(() => {
    switch (urgency) {
      case "live":
        return {
          borderColor: "success.main",
          countdownColor: "success.main",
          hint: "Session start time reached — lights out soon.",
        };
      case "soon":
        return {
          borderColor: "warning.main",
          countdownColor: "warning.light",
          hint: "Less than 24 hours — tune in soon.",
        };
      case "urgent":
        return {
          borderColor: "error.main",
          countdownColor: "error.light",
          hint: "Less than one hour to session start.",
        };
      default:
        return {
          borderColor: "success.dark",
          countdownColor: "success.light",
          hint: "Plenty of time until the next session.",
        };
    }
  }, [urgency]);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Countdown Timer
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Live countdown to the next session start time.
        </Typography>

        {isLoading ? (
          <CountdownSkeleton />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Card
            component="section"
            aria-label="Session countdown"
            variant="outlined"
            data-urgency={urgency}
            sx={{
              borderWidth: 2,
              borderColor: urgencyStyles.borderColor,
              transition: (theme) =>
                theme.transitions.create(["border-color"], { duration: 400 }),
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {target?.meetingName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {target?.sessionName} • {target?.circuit}, {target?.country}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  mt: 3,
                  fontWeight: 800,
                  color: urgencyStyles.countdownColor,
                  ...(shouldPulse && {
                    animation: `${countdownPulse} 1.25s ease-in-out infinite`,
                  }),
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                  },
                }}
              >
                {formatDuration(remaining ?? 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {urgencyStyles.hint}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Starts at: {new Date(target?.startTime ?? "").toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
