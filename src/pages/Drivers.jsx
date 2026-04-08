import { useDriverStandings } from "../hooks/useDriverStandings";
import DriverStandingsTable from "../components/DriverStandingsTable";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Drivers() {
  const { standings, isLoading, error, lastUpdated, refetch } =
    useDriverStandings();
  const chartData = standings.map((driver) => ({
    position: `P${driver.position}`,
    points: driver.points,
    name: driver.fullName,
    code: driver.code,
  }));

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Drivers Standings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            A quick snapshot of top drivers in the championship race.
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </Typography>
          )}
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.paper" }}>
          {isLoading && (
            <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
              <Typography color="text.secondary">Loading standings...</Typography>
            </Stack>
          )}

          {error && (
            <Stack spacing={2}>
              <Alert severity="error">Could not load standings: {error}</Alert>
              <Button
                variant="contained"
                color="error"
                onClick={refetch}
                sx={{ alignSelf: "flex-start" }}
              >
                Retry
              </Button>
            </Stack>
          )}

          {!isLoading && !error && (
            <Stack spacing={3}>
              <Box sx={{ height: { xs: 260, sm: 320 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Driver Points Progression
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="position"
                      stroke="#94a3b8"
                      tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                      formatter={(value) => [`${value} pts`, "Points"]}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.name
                          ? `${label} - ${payload[0].payload.name}${
                              payload[0].payload.code
                                ? ` (${payload[0].payload.code})`
                                : ""
                            }`
                          : label
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="points"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Driver Standings Table
                </Typography>
                <DriverStandingsTable standings={standings} />
              </Box>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
