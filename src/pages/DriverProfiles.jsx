import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
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
  getDriversBySession,
  getLatestDriverChampionship,
} from "../services/openf1";

export default function DriverProfiles() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfiles() {
      try {
        setIsLoading(true);
        setError(null);

        const standings = await getLatestDriverChampionship(controller.signal);
        const sessionKey = standings[0]?.session_key;

        if (!sessionKey) {
          throw new Error("Could not resolve session key for driver profiles");
        }

        const data = await getDriversBySession(sessionKey, controller.signal);
        const mapped = [...data]
          .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""))
          .map((driver) => ({
            id: driver.driver_number,
            fullName: driver.full_name ?? "Unknown Driver",
            acronym: driver.name_acronym ?? "",
            team: driver.team_name ?? "Unknown Team",
            number: driver.driver_number,
            headshot: driver.headshot_url ?? "",
            teamColor: driver.team_colour ? `#${driver.team_colour}` : "",
          }));

        setDrivers(mapped);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load driver profiles");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfiles();
    return () => controller.abort();
  }, []);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Driver Profiles
        </Typography>

        {isLoading ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
            <Typography color="text.secondary">Loading driver profiles...</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={2}>
            {drivers.map((driver) => (
              <Grid key={driver.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={driver.headshot}
                        alt={driver.fullName}
                        sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
                      >
                        {driver.acronym || String(driver.number)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {driver.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{driver.number}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
                      {driver.teamColor && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: driver.teamColor,
                          }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {driver.team}
                      </Typography>
                    </Stack>

                    {driver.acronym && (
                      <Chip
                        label={driver.acronym}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1.5 }}
                      />
                    )}
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
