import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
  getDriversBySession,
  getLatestDriverChampionship,
  getSessionResults,
} from "../services/openf1";

export default function RaceResults() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResults() {
      try {
        setIsLoading(true);
        setError(null);

        const standings = await getLatestDriverChampionship(controller.signal);
        const sessionKey = standings[0]?.session_key;

        if (!sessionKey) {
          throw new Error("Could not resolve session key for race results");
        }

        const [sessionResults, drivers] = await Promise.all([
          getSessionResults(sessionKey, controller.signal),
          getDriversBySession(sessionKey, controller.signal),
        ]);

        const driversByNumber = new Map(
          drivers.map((driver) => [driver.driver_number, driver]),
        );

        const mapped = sessionResults
          .map((item) => {
            const driver = driversByNumber.get(item.driver_number);
            return {
              position: Number(item.position ?? 999),
              driver: driver?.full_name ?? `#${item.driver_number}`,
              team: driver?.team_name ?? "Unknown Team",
              laps: Number(item.number_of_laps ?? 0),
              gap:
                item.gap_to_leader === 0
                  ? "Leader"
                  : String(item.gap_to_leader ?? "N/A"),
              duration:
                typeof item.duration === "number"
                  ? `${item.duration.toFixed(3)}s`
                  : "N/A",
            };
          })
          .sort((a, b) => a.position - b.position);

        setResults(mapped);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load race results");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
    return () => controller.abort();
  }, []);

  const topThree = useMemo(() => results.slice(0, 3), [results]);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Race Results
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Latest race classification from OpenF1 `session_result`.
        </Typography>

        {isLoading ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
            <Typography color="text.secondary">Loading race results...</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Podium
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topThree.length > 0
                  ? topThree
                      .map((entry) => `P${entry.position}: ${entry.driver}`)
                      .join(" • ")
                  : "No data"}
              </Typography>
            </Paper>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pos</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell align="right">Laps</TableCell>
                    <TableCell align="right">Gap</TableCell>
                    <TableCell align="right">Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row) => (
                    <TableRow key={`${row.position}-${row.driver}`} hover>
                      <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                        {row.position}
                      </TableCell>
                      <TableCell>{row.driver}</TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell align="right">{row.laps}</TableCell>
                      <TableCell align="right">{row.gap}</TableCell>
                      <TableCell align="right">{row.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
