import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import { ConstructorDetailSkeleton } from "../components/ApiLoadingSkeletons";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
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

function decodeTeamSlug(raw) {
  if (raw == null || raw === "") return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default function ConstructorDetail() {
  const { teamSlug } = useParams();
  const decodedName = useMemo(() => decodeTeamSlug(teamSlug), [teamSlug]);
  const teamKey = useMemo(() => normTeam(decodedName), [decodedName]);

  const [teamRow, setTeamRow] = useState(null);
  const [roster, setRoster] = useState([]);
  const [teamColor, setTeamColor] = useState("");
  const [sessionKey, setSessionKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        setTeamRow(null);
        setRoster([]);
        setTeamColor("");
        setSessionKey(null);

        if (!teamKey) {
          throw new Error("Missing team in URL");
        }

        const latestStandings = await getLatestDriverChampionship(
          controller.signal,
        );
        const sk = latestStandings[0]?.session_key;

        if (!sk) {
          throw new Error("Could not resolve latest race session");
        }

        setSessionKey(sk);

        const [teamStandings, driversRaw, driverChampRows] = await Promise.all([
          getTeamChampionshipBySession(sk, controller.signal),
          getDriversBySession(sk, controller.signal),
          getChampionshipDriversBySession(sk, controller.signal),
        ]);

        const driversList = Array.isArray(driversRaw) ? driversRaw : [];

        const mergedTeams = mergeConstructorStandings(
          teamStandings,
          driversList,
          driverChampRows,
        );

        const match = mergedTeams.find((t) => normTeam(t.team_name) === teamKey);

        if (!match) {
          setTeamRow(null);
          setRoster([]);
          return;
        }

        setTeamRow(match);

        const name = match.team_name ?? decodedName;
        const nk = normTeam(name);

        const first = driversList.find((d) => normTeam(d.team_name) === nk);
        setTeamColor(first?.team_colour ? `#${first.team_colour}` : "");

        const members = driversList
          .filter((d) => normTeam(d.team_name) === nk)
          .map((d) => ({
            number: d.driver_number,
            fullName: d.full_name ?? `#${d.driver_number}`,
            acronym: d.name_acronym ?? "",
            headshot: d.headshot_url ?? "",
          }))
          .sort((a, b) => Number(a.number) - Number(b.number));

        setRoster(members);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to load team");
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [teamKey, decodedName]);

  const displayName = teamRow?.team_name ?? (decodedName || "Team");
  const position = Number(teamRow?.position_current ?? 0);
  const points = Number(teamRow?.points_current ?? 0);

  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
          <Link component={RouterLink} to="/constructors" color="inherit" underline="hover">
            Constructors
          </Link>
          <Typography color="text.primary">{displayName}</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Team details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Championship and line-up from OpenF1 for the latest session
          {sessionKey != null ? ` (session_key ${sessionKey})` : ""}.
        </Typography>

        {isLoading && <ConstructorDetailSkeleton />}

        {!isLoading && error && <Alert severity="error">{error}</Alert>}

        {!isLoading && !error && !teamRow && (
          <Alert severity="warning">
            No constructor row matched “{decodedName}”. Check the URL or open the constructors
            list.
          </Alert>
        )}

        {!isLoading && !error && teamRow && (
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{
                    alignItems: { xs: "stretch", sm: "center" },
                    justifyContent: "space-between",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {teamColor && (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          bgcolor: teamColor,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {displayName}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={Number.isFinite(position) && position > 0 ? `P${position}` : "P—"}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color="success"
                      label={`${points} pts`}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Drivers
              </Typography>
              {roster.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No drivers listed for this team in session data.
                </Typography>
              ) : (
                <TableContainer
                  component={Card}
                  variant="outlined"
                  sx={{ bgcolor: "background.paper" }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Driver</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roster.map((d) => (
                        <TableRow key={d.number} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{d.number}</TableCell>
                          <TableCell>
                            <Link
                              component={RouterLink}
                              to={`/drivers/${d.number}`}
                              underline="hover"
                              color="inherit"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                maxWidth: "100%",
                              }}
                            >
                              <Avatar
                                src={d.headshot}
                                alt={d.fullName}
                                sx={{ width: 32, height: 32, fontSize: 14 }}
                              >
                                {d.acronym || String(d.number)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {d.fullName}
                                </Typography>
                                {d.acronym ? (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {d.acronym}
                                  </Typography>
                                ) : null}
                              </Box>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
