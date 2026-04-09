import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

function wave(extra = {}) {
  return { animation: "wave", ...extra };
}

/**
 * Accessible loading region for API-backed views (replaces lone spinners).
 */
export function LoadingStateRegion({ label, children, sx }) {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label={label}
      sx={{ width: "100%", ...sx }}
    >
      {children}
    </Box>
  );
}

export function DashboardSkeleton() {
  return (
    <LoadingStateRegion label="Loading dashboard metrics">
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6].map((k) => (
          <Grid key={k} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Skeleton sx={wave()} width="45%" height={20} />
                <Skeleton sx={wave({ mt: 2 })} width="85%" height={32} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </LoadingStateRegion>
  );
}

export function DriversStandingsSkeleton() {
  return (
    <LoadingStateRegion label="Loading standings">
      <Stack spacing={3}>
        <Box>
          <Skeleton sx={wave({ mb: 2 })} width={260} height={28} />
          <Skeleton sx={wave({ borderRadius: 1 })} variant="rounded" height={280} />
        </Box>
        <Box>
          <Skeleton sx={wave({ mb: 2 })} width={220} height={28} />
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell align="right">Points</TableCell>
                  <TableCell align="right">Wins</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 8 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton sx={wave()} width={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton sx={wave()} width="70%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton sx={wave()} width="55%" />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton sx={wave({ ml: "auto" })} width={36} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton sx={wave({ ml: "auto" })} width={40} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </LoadingStateRegion>
  );
}

export function RaceCalendarSkeleton() {
  return (
    <LoadingStateRegion label="Loading race calendar">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} variant="outlined">
            <CardContent>
              <Skeleton sx={wave()} width="75%" height={28} />
              <Skeleton sx={wave({ mt: 1.5 })} width="50%" height={20} />
              <Skeleton sx={wave({ mt: 0.5 })} width="40%" height={20} />
              <Skeleton sx={wave({ mt: 0.5 })} width="35%" height={20} />
              <Skeleton sx={wave({ mt: 2 })} width={100} height={32} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </LoadingStateRegion>
  );
}

export function MeetingSessionsTableSkeleton() {
  return (
    <LoadingStateRegion label="Loading sessions">
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Session</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Start (local)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 8 }, (_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton sx={wave()} width="60%" />
                </TableCell>
                <TableCell>
                  <Skeleton sx={wave()} width="40%" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton sx={wave({ ml: "auto" })} width={140} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </LoadingStateRegion>
  );
}

export function ConstructorsSkeleton() {
  return (
    <LoadingStateRegion label="Loading constructors standings">
      <Grid container spacing={2}>
        {Array.from({ length: 6 }, (_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Skeleton sx={wave()} width="55%" height={32} />
                  <Skeleton sx={wave()} width={72} height={28} variant="rounded" />
                </Stack>
                <Skeleton sx={wave({ mt: 2 })} width="100%" height={40} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </LoadingStateRegion>
  );
}

export function DriverProfilesSkeleton() {
  return (
    <LoadingStateRegion label="Loading driver profiles">
      <Grid container spacing={2}>
        {Array.from({ length: 6 }, (_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Skeleton sx={wave()} variant="circular" width={56} height={56} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton sx={wave()} width="85%" height={28} />
                    <Skeleton sx={wave({ mt: 1 })} width={48} height={20} />
                  </Box>
                </Stack>
                <Skeleton sx={wave({ mt: 2 })} width="70%" height={24} />
                <Skeleton sx={wave({ mt: 1.5 })} width={56} height={26} variant="rounded" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </LoadingStateRegion>
  );
}

export function RaceResultsSkeleton() {
  return (
    <LoadingStateRegion label="Loading race results">
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Skeleton sx={wave({ mb: 1 })} width={100} height={24} />
          <Skeleton sx={wave()} width="90%" height={22} />
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
              {Array.from({ length: 10 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton sx={wave()} width={28} />
                  </TableCell>
                  <TableCell>
                    <Skeleton sx={wave()} width="65%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton sx={wave()} width="50%" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton sx={wave({ ml: "auto" })} width={32} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton sx={wave({ ml: "auto" })} width={48} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton sx={wave({ ml: "auto" })} width={56} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </LoadingStateRegion>
  );
}

export function HeadToHeadSkeleton() {
  return (
    <LoadingStateRegion label="Loading comparison data">
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton sx={wave()} variant="rounded" height={56} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton sx={wave()} variant="rounded" height={56} />
          </Grid>
        </Grid>
        <Card variant="outlined">
          <CardContent>
            <Skeleton sx={wave()} width="70%" height={28} />
            <Skeleton sx={wave({ mt: 1 })} width="55%" height={22} />
          </CardContent>
        </Card>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>
                  <Skeleton sx={wave()} width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton sx={wave()} width={80} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 4 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton sx={wave()} width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton sx={wave()} width="50%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton sx={wave()} width="50%" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </LoadingStateRegion>
  );
}

export function TeamLineupsSkeleton() {
  return (
    <LoadingStateRegion label="Loading line-ups">
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
            {Array.from({ length: 8 }, (_, i) => (
              <TableRow key={i}>
                <TableCell align="right">
                  <Skeleton sx={wave({ ml: "auto" })} width={24} />
                </TableCell>
                <TableCell>
                  <Skeleton sx={wave()} width="55%" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton sx={wave({ ml: "auto" })} width={36} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" gap={0.75} flexWrap="wrap">
                    <Skeleton sx={wave()} width={72} height={28} variant="rounded" />
                    <Skeleton sx={wave()} width={72} height={28} variant="rounded" />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </LoadingStateRegion>
  );
}

export function CountdownSkeleton() {
  return (
    <LoadingStateRegion label="Loading countdown">
      <Card variant="outlined">
        <CardContent>
          <Skeleton sx={wave()} width="70%" height={32} />
          <Skeleton sx={wave({ mt: 1 })} width="85%" height={22} />
          <Skeleton sx={wave({ mt: 3 })} width="90%" height={56} />
          <Skeleton sx={wave({ mt: 2 })} width="60%" height={22} />
        </CardContent>
      </Card>
    </LoadingStateRegion>
  );
}
