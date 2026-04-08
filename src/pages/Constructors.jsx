import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  getLatestDriverChampionship,
  getTeamChampionshipBySession,
} from "../services/openf1";

const TEAM_COLORS = ["primary", "error", "warning", "info", "success"];

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

        const driverChampionship = await getLatestDriverChampionship(
          controller.signal,
        );

        const sessionKey = driverChampionship[0]?.session_key;

        if (!sessionKey) {
          throw new Error("Could not resolve latest race session");
        }

        const teamStandings = await getTeamChampionshipBySession(
          sessionKey,
          controller.signal,
        );

        const mapped = teamStandings
          .sort(
            (a, b) =>
              Number(a.position_current ?? 999) -
              Number(b.position_current ?? 999),
          )
          .map((team, index) => ({
            name: team.team_name ?? "Unknown Team",
            points: Number(team.points_current ?? 0),
            position: Number(team.position_current ?? index + 1),
            color: TEAM_COLORS[index % TEAM_COLORS.length],
          }));

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
          <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
            <Typography color="text.secondary">
              Loading constructors standings...
            </Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={2}>
            {teams.map((team) => (
              <Grid key={team.name} size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: "background.paper",
                    borderColor: "divider",
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "primary.main",
                    },
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
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
