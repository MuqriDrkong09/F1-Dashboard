import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import { HeadToHeadSkeleton } from "../components/ApiLoadingSkeletons";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
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
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DriverRichSummary, { richTooltipSlotProps } from "../components/DriverRichSummary";
import {
  getDriversBySession,
  getLatestDriverChampionship,
  getSessionResults,
} from "../services/openf1";

function normalizeGap(gap) {
  if (gap === null || gap === undefined) return Number.POSITIVE_INFINITY;
  const parsed = Number(gap);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

export default function HeadToHeadComparison() {
  const [drivers, setDrivers] = useState([]);
  const [resultsByDriver, setResultsByDriver] = useState(new Map());
  const [firstDriver, setFirstDriver] = useState("");
  const [secondDriver, setSecondDriver] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchComparisonData() {
      try {
        setIsLoading(true);
        setError(null);

        const standings = await getLatestDriverChampionship(controller.signal);
        const sessionKey = standings[0]?.session_key;
        if (!sessionKey) {
          throw new Error("Could not resolve latest session for comparison");
        }

        const [driversData, resultsData] = await Promise.all([
          getDriversBySession(sessionKey, controller.signal),
          getSessionResults(sessionKey, controller.signal),
        ]);

        const mappedDrivers = [...driversData]
          .map((driver) => ({
            id: Number(driver.driver_number),
            name: driver.full_name ?? `#${driver.driver_number}`,
            team: driver.team_name ?? "Unknown Team",
            acronym: driver.name_acronym ?? "",
            headshotUrl: driver.headshot_url ?? "",
            teamColor: driver.team_colour ? `#${driver.team_colour}` : "",
            broadcastName: driver.broadcast_name ?? "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const resultMap = new Map(
          resultsData.map((item) => [Number(item.driver_number), item]),
        );

        setDrivers(mappedDrivers);
        setResultsByDriver(resultMap);

        if (mappedDrivers.length >= 2) {
          setFirstDriver(String(mappedDrivers[0].id));
          setSecondDriver(String(mappedDrivers[1].id));
        } else if (mappedDrivers.length === 1) {
          setFirstDriver(String(mappedDrivers[0].id));
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load head-to-head data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchComparisonData();
    return () => controller.abort();
  }, []);

  const first = useMemo(
    () => drivers.find((driver) => String(driver.id) === firstDriver) ?? null,
    [drivers, firstDriver],
  );
  const second = useMemo(
    () => drivers.find((driver) => String(driver.id) === secondDriver) ?? null,
    [drivers, secondDriver],
  );

  const firstResult = first ? resultsByDriver.get(first.id) : null;
  const secondResult = second ? resultsByDriver.get(second.id) : null;

  const metrics = useMemo(() => {
    if (!first || !second) return [];

    const firstPosition = Number(firstResult?.position ?? 999);
    const secondPosition = Number(secondResult?.position ?? 999);
    const firstLaps = Number(firstResult?.number_of_laps ?? 0);
    const secondLaps = Number(secondResult?.number_of_laps ?? 0);
    const firstGap = normalizeGap(firstResult?.gap_to_leader);
    const secondGap = normalizeGap(secondResult?.gap_to_leader);

    return [
      {
        label: "Position",
        a: firstResult?.position ?? "N/A",
        b: secondResult?.position ?? "N/A",
        winner: firstPosition < secondPosition ? "a" : secondPosition < firstPosition ? "b" : "",
      },
      {
        label: "Laps",
        a: firstResult?.number_of_laps ?? "N/A",
        b: secondResult?.number_of_laps ?? "N/A",
        winner: firstLaps > secondLaps ? "a" : secondLaps > firstLaps ? "b" : "",
      },
      {
        label: "Gap To Leader",
        a: firstResult?.gap_to_leader ?? "Leader",
        b: secondResult?.gap_to_leader ?? "Leader",
        winner: firstGap < secondGap ? "a" : secondGap < firstGap ? "b" : "",
      },
      {
        label: "Duration",
        a: firstResult?.duration ?? "N/A",
        b: secondResult?.duration ?? "N/A",
        winner:
          Number(firstResult?.duration ?? Infinity) <
          Number(secondResult?.duration ?? Infinity)
            ? "a"
            : Number(secondResult?.duration ?? Infinity) <
                Number(firstResult?.duration ?? Infinity)
              ? "b"
              : "",
      },
    ];
  }, [first, second, firstResult, secondResult]);

  const comparisonTooltipTitle = useMemo(() => {
    if (!first || !second) return null;

    const sessionFinishFromResult = (r) =>
      r
        ? {
            position: r.position,
            laps: Number(r.number_of_laps ?? 0),
            gap:
              r.gap_to_leader === 0
                ? "Leader"
                : String(r.gap_to_leader ?? "N/A"),
            duration:
              typeof r.duration === "number"
                ? `${Number(r.duration).toFixed(3)}s`
                : "N/A",
          }
        : null;

    return (
      <Stack spacing={2} divider={<Divider flexItem />}>
        <DriverRichSummary
          fullName={first.name}
          driverNumber={first.id}
          code={first.acronym}
          headshotUrl={first.headshotUrl}
          teamName={first.team}
          teamColor={first.teamColor}
          broadcastName={first.broadcastName}
          sessionFinish={sessionFinishFromResult(firstResult)}
        />
        <DriverRichSummary
          fullName={second.name}
          driverNumber={second.id}
          code={second.acronym}
          headshotUrl={second.headshotUrl}
          teamName={second.team}
          teamColor={second.teamColor}
          broadcastName={second.broadcastName}
          sessionFinish={sessionFinishFromResult(secondResult)}
        />
      </Stack>
    );
  }, [first, second, firstResult, secondResult]);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Head-to-Head Comparison
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Compare two drivers using OpenF1 `drivers` and `session_result`.
        </Typography>

        {isLoading ? (
          <HeadToHeadSkeleton />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="driver-a-label">Driver A</InputLabel>
                  <Select
                    labelId="driver-a-label"
                    label="Driver A"
                    value={firstDriver}
                    onChange={(event) => setFirstDriver(event.target.value)}
                  >
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={String(driver.id)}>
                        {driver.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="driver-b-label">Driver B</InputLabel>
                  <Select
                    labelId="driver-b-label"
                    label="Driver B"
                    value={secondDriver}
                    onChange={(event) => setSecondDriver(event.target.value)}
                  >
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={String(driver.id)}>
                        {driver.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {comparisonTooltipTitle ? (
              <Tooltip
                enterTouchDelay={0}
                slotProps={richTooltipSlotProps}
                title={comparisonTooltipTitle}
              >
                <Card variant="outlined" sx={{ cursor: "help" }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      {first?.name ?? "Driver A"} vs {second?.name ?? "Driver B"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {first?.team ?? "N/A"} vs {second?.team ?? "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {first?.name ?? "Driver A"} vs {second?.name ?? "Driver B"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {first?.team ?? "N/A"} vs {second?.team ?? "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>{first?.name ?? "Driver A"}</TableCell>
                    <TableCell>{second?.name ?? "Driver B"}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.label} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{metric.label}</TableCell>
                      <TableCell
                        sx={{
                          color: metric.winner === "a" ? "success.main" : "text.primary",
                          fontWeight: metric.winner === "a" ? 700 : 400,
                        }}
                      >
                        {metric.a}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: metric.winner === "b" ? "success.main" : "text.primary",
                          fontWeight: metric.winner === "b" ? 700 : 400,
                        }}
                      >
                        {metric.b}
                      </TableCell>
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
