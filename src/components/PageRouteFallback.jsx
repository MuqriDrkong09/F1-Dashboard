import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Shown while a lazily loaded route chunk is loading (matches main content width).
 */
export default function PageRouteFallback() {
  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ py: 6, alignItems: "center" }}>
          <CircularProgress aria-label="Loading page" />
          <Typography color="text.secondary">Loading page…</Typography>
        </Stack>
      </Container>
    </Box>
  );
}
