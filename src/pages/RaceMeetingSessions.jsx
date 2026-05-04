import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Container from "@mui/material/Container";
import { MeetingSessionsTableSkeleton } from "../components/ApiLoadingSkeletons";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { getSessionsByMeeting, resolveMeetingForDetail } from "../services/openf1";

function formatSessionStart(iso) {
  if (!iso) return "TBD";
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t).toLocaleString() : String(iso);
}

export default function RaceMeetingSessions() {
  const { meetingKey: meetingKeyParam } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const meetingKeyNum = useMemo(() => Number(meetingKeyParam), [meetingKeyParam]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        setMeeting(null);
        setSessions([]);

        if (!Number.isFinite(meetingKeyNum)) {
          throw new Error("Invalid meeting in URL");
        }

        const [meetingRow, sessionList] = await Promise.all([
          resolveMeetingForDetail(meetingKeyNum, controller.signal),
          getSessionsByMeeting(meetingKeyNum, controller.signal),
        ]);

        setMeeting(meetingRow);
        const sorted = [...sessionList].sort((a, b) =>
          (a.date_start ?? "").localeCompare(b.date_start ?? ""),
        );
        setSessions(sorted);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load sessions");
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [meetingKeyNum]);

  const title = meeting?.meeting_name ?? "Race weekend";

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
          <Link component={RouterLink} to="/races" color="inherit" underline="hover">
            Race calendar
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Sessions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Sessions from OpenF1 <code>sessions?meeting_key=</code>. Meeting title may come from{" "}
          <code>meeting?meeting_key=</code> or the season <code>meetings</code> list if the single-meeting
          endpoint returns 404.
        </Typography>

        {meeting && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {meeting.circuit_short_name ?? "Circuit"} · {meeting.country_name ?? ""}
          </Typography>
        )}

        {isLoading ? (
          <MeetingSessionsTableSkeleton />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : sessions.length === 0 ? (
          <Alert severity="info">No sessions listed for this meeting.</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Session</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Start (local)</TableCell>
                  <TableCell align="right">Lap data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session, index) => (
                  <TableRow
                    key={session.session_key ?? `${session.session_name}-${index}`}
                    hover
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {session.session_name ?? "Session"}
                    </TableCell>
                    <TableCell>{session.session_type ?? "—"}</TableCell>
                    <TableCell align="right">
                      {formatSessionStart(session.date_start)}
                    </TableCell>
                    <TableCell align="right">
                      {Number.isFinite(Number(session.session_key)) ? (
                        <Link
                          component={RouterLink}
                          to={`/races/${meetingKeyNum}/session/${session.session_key}/laps`}
                          underline="hover"
                        >
                          View laps
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
