import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import { TeamLineupsSkeleton } from "../components/ApiLoadingSkeletons";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import DriverRichSummary, { richTooltipSlotProps } from "../components/DriverRichSummary";
import TeamRichSummary from "../components/TeamRichSummary";
import {
  getChampionshipDriversBySession,
  getDriversBySession,
  getLatestDriverChampionship,
  getTeamChampionshipBySession,
} from "../services/openf1";
import { mergeConstructorStandings } from "../utils/mergeConstructorStandings";

function normTeam(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase();
}

export default function TeamDriverMapping() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const standings = await getLatestDriverChampionship(controller.signal);
        const sessionKey = standings[0]?.session_key;
        if (!sessionKey) {
          throw new Error("Could not resolve latest session for team mapping");
        }

        const [driversRaw, teamsRaw, driverChampionship] = await Promise.all([
          getDriversBySession(sessionKey, controller.signal),
          getTeamChampionshipBySession(sessionKey, controller.signal),
          getChampionshipDriversBySession(sessionKey, controller.signal),
        ]);

        const mergedTeams = mergeConstructorStandings(
          teamsRaw,
          driversRaw,
          driverChampionship,
        );

        const teamsSorted = [...mergedTeams].sort(
          (a, b) =>
            Number(a.position_current ?? 999) - Number(b.position_current ?? 999),
        );

        const driversByTeam = new Map();
        for (const d of driversRaw) {
          const key = normTeam(d.team_name);
          if (!driversByTeam.has(key)) driversByTeam.set(key, []);
          driversByTeam.get(key).push({
            number: d.driver_number,
            name: d.full_name ?? `#${d.driver_number}`,
            acronym: d.name_acronym ?? "",
          });
        }
        for (const list of driversByTeam.values()) {
          list.sort((a, b) => Number(a.number) - Number(b.number));
        }

        const teamColorForKey = (key) => {
          const d = driversRaw.find((x) => normTeam(x.team_name) === key);
          return d?.team_colour ? `#${d.team_colour}` : "";
        };

        const usedDriverKeys = new Set();
        const built = teamsSorted.map((team) => {
          const label = team.team_name ?? "Unknown Team";
          const k = normTeam(label);
          const drivers = driversByTeam.get(k) ?? [];
          usedDriverKeys.add(k);
          return {
            position: Number(team.position_current ?? 999),
            teamName: label,
            points: Number(team.points_current ?? 0),
            drivers,
            teamColor: teamColorForKey(k),
          };
        });

        const orphanTeams = [];
        for (const [key, drivers] of driversByTeam) {
          if (!usedDriverKeys.has(key) && drivers.length > 0) {
            const displayName =
              driversRaw.find((d) => normTeam(d.team_name) === key)?.team_name ??
              key;
            orphanTeams.push({
              position: 999,
              teamName: displayName,
              points: null,
              drivers,
              teamColor: teamColorForKey(key),
            });
          }
        }
        orphanTeams.sort((a, b) => a.teamName.localeCompare(b.teamName));

        setRows([...built, ...orphanTeams]);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load team–driver mapping");
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const hasRows = rows.length > 0;

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Team / driver line-ups
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Constructors standings plus drivers for the latest session (`championship_teams` +
          `drivers?session_key=`).
        </Typography>

        {isLoading ? (
          <TeamLineupsSkeleton />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !hasRows ? (
          <Alert severity="info">No team or driver data for this session.</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="right">Pos</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell align="right">Pts</TableCell>
                  <TableCell>Drivers</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={`${row.position}-${row.teamName}-${index}`} hover>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {row.position < 900 ? row.position : "—"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Tooltip
                        enterTouchDelay={0}
                        slotProps={richTooltipSlotProps}
                        title={
                          <TeamRichSummary
                            name={row.teamName}
                            teamColor={row.teamColor}
                            position={row.position < 900 ? row.position : null}
                            points={row.points}
                            roster={row.drivers}
                          />
                        }
                      >
                        <Box component="span" sx={{ cursor: "help" }}>
                          {row.teamName}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      {row.points != null ? row.points : "—"}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {row.drivers.map((d) => (
                          <Tooltip
                            key={`${row.teamName}-${d.number}-${d.name}`}
                            enterTouchDelay={0}
                            slotProps={richTooltipSlotProps}
                            title={
                              <DriverRichSummary
                                fullName={d.name}
                                driverNumber={d.number}
                                code={d.acronym}
                                teamName={row.teamName}
                                teamColor={row.teamColor}
                              />
                            }
                          >
                            <Chip
                              size="small"
                              variant="outlined"
                              label={`#${d.number} ${d.acronym || d.name}`}
                              sx={{ cursor: "help" }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
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
