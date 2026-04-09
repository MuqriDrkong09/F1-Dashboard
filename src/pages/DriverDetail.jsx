import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import { DriverDetailSkeleton } from "../components/ApiLoadingSkeletons";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  getDriverBySessionAndNumber,
  getDriversBySession,
  getLatestDriverChampionship,
} from "../services/openf1";

export default function DriverDetail() {
  const { driverNumber: driverNumberParam } = useParams();
  const driverNum = useMemo(
    () => Number.parseInt(String(driverNumberParam), 10),
    [driverNumberParam],
  );

  const [driver, setDriver] = useState(null);
  const [championship, setChampionship] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        setDriver(null);
        setChampionship(null);
        setSessionKey(null);

        if (!Number.isFinite(driverNum)) {
          throw new Error("Invalid driver number in URL");
        }

        const standings = await getLatestDriverChampionship(controller.signal);
        const sk = standings[0]?.session_key;

        if (!sk) {
          throw new Error("Could not resolve session for driver data");
        }

        setSessionKey(sk);

        const champRow = standings.find(
          (r) => Number(r.driver_number) === driverNum,
        );
        setChampionship(champRow ?? null);

        let row = await getDriverBySessionAndNumber(sk, driverNum, controller.signal);
        if (!row) {
          const all = await getDriversBySession(sk, controller.signal);
          row = all.find((d) => Number(d.driver_number) === driverNum) ?? null;
        }

        setDriver(row);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load driver");
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [driverNum]);

  const fullName =
    driver?.full_name ?? (Number.isFinite(driverNum) ? `Driver #${driverNum}` : "Driver");
  const acronym = driver?.name_acronym ?? "";
  const teamName = driver?.team_name ?? "Unknown Team";
  const teamColor = driver?.team_colour ? `#${driver.team_colour}` : "";
  const headshot = driver?.headshot_url ?? "";
  const broadcastName = driver?.broadcast_name ?? "";

  const teamDetailTo = `/constructors/team/${encodeURIComponent(teamName)}`;

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
          <Link component={RouterLink} to="/drivers" color="inherit" underline="hover">
            Drivers standings
          </Link>
          <Typography color="text.primary">{fullName}</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Driver profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          OpenF1 session driver data for the latest championship snapshot
          {sessionKey != null ? ` (session_key ${sessionKey})` : ""}.
        </Typography>

        {isLoading && <DriverDetailSkeleton />}

        {!isLoading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && !driver && (
          <Alert
            severity="warning"
            action={
              <Button component={RouterLink} to="/profiles" color="inherit" size="small">
                Browse profiles
              </Button>
            }
          >
            No driver row found for #{driverNum} in this session.
          </Alert>
        )}

        {!isLoading && !error && driver && (
          <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                sx={{ alignItems: { xs: "stretch", md: "flex-start" } }}
              >
                <Avatar
                  src={headshot}
                  alt={fullName}
                  sx={{ width: 120, height: 120, bgcolor: "primary.main", fontSize: 40 }}
                >
                  {acronym || String(driverNum)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {fullName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    #{driverNum}
                    {acronym ? ` · ${acronym}` : ""}
                  </Typography>
                  {broadcastName && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Broadcast: {broadcastName}
                    </Typography>
                  )}

                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 2 }}>
                    {championship && (
                      <>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`P${Number(championship.position_current ?? "—")}`}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          color="success"
                          label={`${Number(championship.points_current ?? 0)} pts`}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Wins: ${Number(championship.wins ?? championship.wins_current ?? 0)}`}
                        />
                      </>
                    )}
                    {!championship && (
                      <Chip size="small" variant="outlined" label="No championship row" />
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                    {teamColor && (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: teamColor,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography variant="body2" color="text.secondary" component="span">
                      Team:{" "}
                    </Typography>
                    <Link
                      component={RouterLink}
                      to={teamDetailTo}
                      underline="hover"
                      color="primary"
                    >
                      {teamName}
                    </Link>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
