import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const year = new Date().getFullYear();

const linkSx = {
  color: "text.secondary",
  fontSize: "0.8125rem",
  "&:hover": { color: "primary.main" },
};

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        py: 2.5,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            © {year} F1 Dashboard — unofficial fan / portfolio project.
          </Typography>
          <Stack
            component="nav"
            direction="row"
            flexWrap="wrap"
            spacing={2}
            alignItems="center"
            aria-label="Footer links"
          >
            <Link component={RouterLink} to="/dashboard" underline="hover" sx={linkSx}>
              Dashboard
            </Link>
            <Link component={RouterLink} to="/races" underline="hover" sx={linkSx}>
              Races
            </Link>
            <Link component={RouterLink} to="/acknowledgements" underline="hover" sx={linkSx}>
              Acknowledgements
            </Link>
            <Link
              href="https://openf1.org"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={linkSx}
            >
              OpenF1
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
