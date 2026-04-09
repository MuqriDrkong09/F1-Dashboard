import { lazy, Suspense, useState } from "react";
import { keyframes } from "@mui/material/styles";
import {
  Link as RouterLink,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import PageRouteFallback from "./components/PageRouteFallback";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Constructors = lazy(() => import("./pages/Constructors"));
const Races = lazy(() => import("./pages/Races"));
const RaceMeetingSessions = lazy(() => import("./pages/RaceMeetingSessions"));
const TeamDriverMapping = lazy(() => import("./pages/TeamDriverMapping"));
const CountdownTimer = lazy(() => import("./pages/CountdownTimer"));
const DriverProfiles = lazy(() => import("./pages/DriverProfiles"));
const RaceResults = lazy(() => import("./pages/RaceResults"));
const HeadToHeadComparison = lazy(() => import("./pages/HeadToHeadComparison"));

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/drivers", label: "Drivers" },
  { to: "/constructors", label: "Constructors" },
  { to: "/team-drivers", label: "Line-ups" },
  { to: "/races", label: "Races" },
  { to: "/countdown", label: "Countdown" },
  { to: "/profiles", label: "Profiles" },
  { to: "/results", label: "Results" },
  { to: "/head-to-head", label: "Head-to-Head" },
];

const routeEnter = keyframes`
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", backdropFilter: "blur(8px)" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 64, gap: 1 }}>
            <Typography
              variant="subtitle2"
              component={RouterLink}
              to="/dashboard"
              sx={{
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "primary.main",
                fontWeight: 700,
                textDecoration: "none",
                flexShrink: 0,
                "&:hover": { opacity: 0.92 },
                "&:focus-visible": {
                  outline: 2,
                  outlineColor: "primary.main",
                  outlineOffset: 4,
                  borderRadius: 1,
                },
              }}
            >
              F1 Dashboard
            </Typography>

            <Box
              component="nav"
              aria-label="Main pages"
              sx={{
                ml: "auto",
                display: { xs: "none", md: "flex" },
                flexWrap: "wrap",
                justifyContent: "flex-end",
                gap: 0.5,
                rowGap: 0.75,
                maxWidth: { md: "min(100%, 720px)", lg: "none" },
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  size="small"
                  sx={{
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    px: 1.25,
                    py: 0.5,
                    "&.active": {
                      color: "common.white",
                      bgcolor: "primary.main",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <IconButton
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              aria-controls="app-mobile-nav"
              onClick={() => setIsMenuOpen(true)}
              sx={{ ml: "auto", display: { xs: "inline-flex", md: "none" }, color: "text.secondary" }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        slotProps={{
          paper: {
            id: "app-mobile-nav",
            component: "nav",
            "aria-label": "Main navigation",
          },
        }}
      >
        <Stack sx={{ width: 260, maxWidth: "85vw", p: 2, gap: 0.5 }}>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              sx={{
                justifyContent: "flex-start",
                color: "text.primary",
                py: 1,
                "&.active": { color: "primary.main", fontWeight: 700 },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Drawer>

      <Box
        key={location.pathname}
        sx={{
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
          animation: `${routeEnter} 340ms cubic-bezier(0.22, 1, 0.36, 1) both`,
        }}
      >
        <Suspense fallback={<PageRouteFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/constructors" element={<Constructors />} />
            <Route path="/races/:meetingKey" element={<RaceMeetingSessions />} />
            <Route path="/races" element={<Races />} />
            <Route path="/team-drivers" element={<TeamDriverMapping />} />
            <Route path="/countdown" element={<CountdownTimer />} />
            <Route path="/profiles" element={<DriverProfiles />} />
            <Route path="/results" element={<RaceResults />} />
            <Route path="/head-to-head" element={<HeadToHeadComparison />} />
          </Routes>
        </Suspense>
      </Box>
    </Box>
  );
}
