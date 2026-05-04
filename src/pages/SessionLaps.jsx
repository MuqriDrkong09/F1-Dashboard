import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { SessionLapsSkeleton } from "../components/ApiLoadingSkeletons";
import {
  getDriversBySession,
  getLapsBySession,
  getSessionsByMeeting,
  resolveMeetingForDetail,
} from "../services/openf1";

function formatSeconds(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toFixed(3);
}

function formatSpeed(kmh) {
  if (kmh == null || !Number.isFinite(Number(kmh))) return "—";
  return `${Math.round(Number(kmh))}`;
}

export default function SessionLaps() {
  const { meetingKey: meetingKeyParam, sessionKey: sessionKeyParam } = useParams();

  const meetingKeyNum = useMemo(() => Number(meetingKeyParam), [meetingKeyParam]);
  const sessionKeyNum = useMemo(() => Number(sessionKeyParam), [sessionKeyParam]);

  const [meeting, setMeeting] = useState(null);
  const [sessionLabel, setSessionLabel] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [laps, setLaps] = useState([]);
  const [driverNumber, setDriverNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        setMeeting(null);
        setSessionLabel("");
        setDrivers([]);
        setLaps([]);
        setDriverNumber("");

        if (!Number.isFinite(meetingKeyNum) || !Number.isFinite(sessionKeyNum)) {
          throw new Error("Invalid meeting or session in URL");
        }

        const [meetingRow, sessionList, lapRows, roster] = await Promise.all([
          resolveMeetingForDetail(meetingKeyNum, controller.signal),
          getSessionsByMeeting(meetingKeyNum, controller.signal),
          getLapsBySession(sessionKeyNum, controller.signal),
          getDriversBySession(sessionKeyNum, controller.signal),
        ]);

        setMeeting(meetingRow);
        const sessionHit = sessionList.find(
          (s) => Number(s.session_key) === sessionKeyNum,
        );
        const label =
          sessionHit?.session_name && sessionHit?.session_type
            ? `${sessionHit.session_name} (${sessionHit.session_type})`
            : sessionHit?.session_name ?? `Session ${sessionKeyNum}`;
        setSessionLabel(label);

        const sortedDrivers = [...roster].sort(
          (a, b) => Number(a.driver_number) - Number(b.driver_number),
        );
        setDrivers(sortedDrivers);
        setLaps(Array.isArray(lapRows) ? lapRows : []);

        const rosterNums = sortedDrivers.map((d) => Number(d.driver_number));
        const defaultNum =
          rosterNums.find((n) => Number.isFinite(n)) ??
          Number(lapRows.find((r) => Number.isFinite(Number(r.driver_number)))?.driver_number);
        if (defaultNum != null && Number.isFinite(defaultNum)) {
          setDriverNumber(String(defaultNum));
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load laps");
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [meetingKeyNum, sessionKeyNum]);

  const lapsForDriver = useMemo(() => {
    if (!driverNumber) return [];
    const n = Number(driverNumber);
    return laps
      .filter((row) => Number(row.driver_number) === n)
      .sort((a, b) => Number(a.lap_number) - Number(b.lap_number));
  }, [laps, driverNumber]);

  const driverMenuItems = useMemo(() => {
    const byNum = new Map();
    for (const d of drivers) {
      const n = Number(d.driver_number);
      if (!Number.isFinite(n)) continue;
      byNum.set(n, {
        key: n,
        label: `#${n} ${d.full_name ?? d.broadcast_name ?? ""}`.trim(),
      });
    }
    for (const row of laps) {
      const n = Number(row.driver_number);
      if (!Number.isFinite(n) || byNum.has(n)) continue;
      byNum.set(n, { key: n, label: `#${n}` });
    }
    return [...byNum.values()].sort((a, b) => a.key - b.key);
  }, [drivers, laps]);

  const title = meeting?.meeting_name ?? "Race weekend";

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
          <Link component={RouterLink} to="/races" color="inherit" underline="hover">
            Race calendar
          </Link>
          <Link
            component={RouterLink}
            to={`/races/${meetingKeyNum}`}
            color="inherit"
            underline="hover"
          >
            {title}
          </Link>
          <Typography color="text.primary">Lap times</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Lap times
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Sector splits, lap duration, intermediate speeds, and speed trap from OpenF1{" "}
          <code>laps?session_key=</code>. Mini-sector colour codes are omitted here; see{" "}
          <Link href="https://openf1.org/docs#laps" target="_blank" rel="noopener noreferrer">
            OpenF1 lap docs
          </Link>
          .
        </Typography>

        {meeting && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {sessionLabel}
            {meeting.circuit_short_name ? ` · ${meeting.circuit_short_name}` : ""}
            {meeting.country_name ? ` · ${meeting.country_name}` : ""}
          </Typography>
        )}

        {isLoading ? (
          <SessionLapsSkeleton />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : laps.length === 0 ? (
          <Alert severity="info">
            No lap timing rows for this session yet (OpenF1 may still be ingesting data).
          </Alert>
        ) : (
          <Stack spacing={2}>
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel id="session-laps-driver-label">Driver</InputLabel>
              <Select
                labelId="session-laps-driver-label"
                label="Driver"
                value={driverNumber}
                onChange={(e) => setDriverNumber(e.target.value)}
              >
                {driverMenuItems.map((item) => (
                  <MenuItem key={item.key} value={String(item.key)}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {driverNumber && lapsForDriver.length === 0 ? (
              <Alert severity="info">
                No lap rows for driver #{driverNumber} in this session (they may not have run yet,
                or data is still ingesting).
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Lap</TableCell>
                      <TableCell align="right">S1 (s)</TableCell>
                      <TableCell align="right">S2 (s)</TableCell>
                      <TableCell align="right">S3 (s)</TableCell>
                      <TableCell align="right">Lap (s)</TableCell>
                      <TableCell align="right">I1 (km/h)</TableCell>
                      <TableCell align="right">I2 (km/h)</TableCell>
                      <TableCell align="right">Speed trap</TableCell>
                      <TableCell align="center">Pit out</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lapsForDriver.map((row) => (
                      <TableRow key={`${row.driver_number}-${row.lap_number}-${row.date_start ?? ""}`} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.lap_number ?? "—"}</TableCell>
                        <TableCell align="right">{formatSeconds(row.duration_sector_1)}</TableCell>
                        <TableCell align="right">{formatSeconds(row.duration_sector_2)}</TableCell>
                        <TableCell align="right">{formatSeconds(row.duration_sector_3)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatSeconds(row.lap_duration)}
                        </TableCell>
                        <TableCell align="right">{formatSpeed(row.i1_speed)}</TableCell>
                        <TableCell align="right">{formatSpeed(row.i2_speed)}</TableCell>
                        <TableCell align="right">{formatSpeed(row.st_speed)}</TableCell>
                        <TableCell align="center">
                          {row.is_pit_out_lap === true ? "Yes" : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
