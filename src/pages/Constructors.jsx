import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import { ConstructorsSkeleton } from "../components/ApiLoadingSkeletons";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { richTooltipSlotProps } from "../components/DriverRichSummary";
import TeamRichSummary from "../components/TeamRichSummary";
import {
  getChampionshipDriversBySession,
  getDriversBySession,
  getLatestDriverChampionship,
  getTeamChampionshipBySession,
} from "../services/openf1";
import { mergeConstructorStandings } from "../utils/mergeConstructorStandings";

const TEAM_COLORS = ["primary", "error", "warning", "info", "success"];

function normTeam(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase();
}

export default function Constructors() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchConstructorStandings() {
      try {
        setIsLoading(true);
        setError(null);

        const latestStandings = await getLatestDriverChampionship(
          controller.signal,
        );

        const sessionKey = latestStandings[0]?.session_key;

        if (!sessionKey) {
          throw new Error("Could not resolve latest race session");
        }

        const [teamStandings, driversRaw, driverChampRows] = await Promise.all([
          getTeamChampionshipBySession(sessionKey, controller.signal),
          getDriversBySession(sessionKey, controller.signal),
          getChampionshipDriversBySession(sessionKey, controller.signal),
        ]);

        const driversList = Array.isArray(driversRaw) ? driversRaw : [];

        const mergedTeams = mergeConstructorStandings(
          teamStandings,
          driversList,
          driverChampRows,
        );

        const rosterByTeam = new Map();
        for (const d of driversList) {
          const k = normTeam(d.team_name);
          if (!rosterByTeam.has(k)) rosterByTeam.set(k, []);
          rosterByTeam.get(k).push({
            number: d.driver_number,
            name: d.full_name ?? `#${d.driver_number}`,
            acronym: d.name_acronym ?? "",
          });
        }
        for (const list of rosterByTeam.values()) {
          list.sort((a, b) => Number(a.number) - Number(b.number));
        }

        const mapped = mergedTeams
          .sort(
            (a, b) =>
              Number(a.position_current ?? 999) -
              Number(b.position_current ?? 999),
          )
          .map((team, index) => {
            const name = team.team_name ?? "Unknown Team";
            const key = normTeam(name);
            const roster = rosterByTeam.get(key) ?? [];
            const firstDriver = driversList.find(
              (d) => normTeam(d.team_name) === key,
            );
            const teamColor = firstDriver?.team_colour
              ? `#${firstDriver.team_colour}`
              : "";
            return {
              name,
              points: Number(team.points_current ?? 0),
              position: Number(team.position_current ?? index + 1),
              color: TEAM_COLORS[index % TEAM_COLORS.length],
              roster,
              teamColor,
            };
          });

        setTeams(mapped);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load constructors standings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConstructorStandings();
    return () => controller.abort();
  }, []);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Constructors Table
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Team points battle across the current F1 season.
          </Typography>
        </Box>

        {isLoading ? (
          <ConstructorsSkeleton />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={2}>
            {teams.map((team) => (
              <Grid key={team.name} size={{ xs: 12, sm: 6 }}>
                <Tooltip
                  enterTouchDelay={0}
                  slotProps={richTooltipSlotProps}
                  title={
                    <TeamRichSummary
                      name={team.name}
                      teamColor={team.teamColor}
                      position={team.position}
                      points={team.points}
                      roster={team.roster}
                    />
                  }
                >
                  <Card
                    component={RouterLink}
                    to={`/constructors/team/${encodeURIComponent(team.name)}`}
                    variant="outlined"
                    sx={{
                      bgcolor: "background.paper",
                      borderColor: "divider",
                      cursor: "pointer",
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                    }}
                  >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        P{team.position} - {team.name}
                      </Typography>
                      <Chip
                        label={`${team.points} pts`}
                        color={team.color}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1.5 }}
                    >
                      Live constructors points from OpenF1 championship data.
                    </Typography>
                  </CardContent>
                </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
