import { lazy, Suspense, useState } from "react";
import { alpha, keyframes } from "@mui/material/styles";
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
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PageRouteFallback from "./components/PageRouteFallback";
import SiteFooter from "./components/SiteFooter";
import { useThemeMode } from "./context/AppThemeProvider";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const Media = lazy(() => import("./pages/Media"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Constructors = lazy(() => import("./pages/Constructors"));
const Races = lazy(() => import("./pages/Races"));
const RaceMeetingSessions = lazy(() => import("./pages/RaceMeetingSessions"));
const TeamDriverMapping = lazy(() => import("./pages/TeamDriverMapping"));
const CountdownTimer = lazy(() => import("./pages/CountdownTimer"));
const DriverProfiles = lazy(() => import("./pages/DriverProfiles"));
const DriverDetail = lazy(() => import("./pages/DriverDetail"));
const ConstructorDetail = lazy(() => import("./pages/ConstructorDetail"));
const RaceResults = lazy(() => import("./pages/RaceResults"));
const SessionLaps = lazy(() => import("./pages/SessionLaps"));
const HeadToHeadComparison = lazy(() => import("./pages/HeadToHeadComparison"));
const Acknowledgements = lazy(() => import("./pages/Acknowledgements"));

/** Grouped nav: ~4 top-level destinations (Dashboard + 3 menus) for easier scanning. */
const navGroups = [
  {
    id: "schedule",
    label: "Schedule",
    items: [
      { to: "/races", label: "Races" },
      { to: "/countdown", label: "Countdown" },
    ],
  },
  {
    id: "standings",
    label: "Standings",
    items: [
      { to: "/drivers", label: "Drivers" },
      { to: "/constructors", label: "Constructors" },
      { to: "/team-drivers", label: "Line-ups" },
    ],
  },
  {
    id: "explore",
    label: "Explore",
    items: [
      { to: "/profiles", label: "Profiles" },
      { to: "/results", label: "Results" },
      { to: "/head-to-head", label: "Head-to-Head" },
    ],
  },
];

function pathMatchesNavItem(pathname, to) {
  if (to === "/news") {
    return pathname === "/news" || pathname.startsWith("/news/");
  }
  if (to === "/races") {
    return pathname === "/races" || pathname.startsWith("/races/");
  }
  if (to === "/drivers") {
    return pathname === "/drivers" || pathname.startsWith("/drivers/");
  }
  if (to === "/constructors") {
    return pathname === "/constructors" || pathname.startsWith("/constructors/");
  }
  return pathname === to;
}

function groupIsActive(group, pathname) {
  return group.items.some((item) => pathMatchesNavItem(pathname, item.to));
}

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

const navBarUnderline = {
  position: "relative",
  overflow: "visible",
  "&::after": {
    content: '""',
    position: "absolute",
    left: "50%",
    bottom: -8,
    width: "68%",
    height: 3,
    borderRadius: 10,
    transform: "translateX(-50%) scaleX(0)",
    transformOrigin: "center",
    transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
    pointerEvents: "none",
  },
  "&.active::after": {
    transform: "translateX(-50%) scaleX(1)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&::after": { transition: "none" },
  },
};

export default function App() {
  const { mode, toggleMode } = useThemeMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navMenuGroupId, setNavMenuGroupId] = useState(null);
  const [navMenuAnchor, setNavMenuAnchor] = useState(null);
  const location = useLocation();

  const closeNavMenu = () => {
    setNavMenuGroupId(null);
    setNavMenuAnchor(null);
  };

  const openNavMenu = (groupId, event) => {
    setNavMenuGroupId(groupId);
    setNavMenuAnchor(event.currentTarget);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
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
                flexWrap: "nowrap",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 0.5,
              }}
            >
              <Button
                component={NavLink}
                to="/dashboard"
                end={true}
                size="small"
                sx={{
                  ...navBarUnderline,
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  px: 1.25,
                  py: 0.5,
                  "&::after": {
                    ...navBarUnderline["&::after"],
                    bgcolor: "primary.light",
                  },
                  "&.active": {
                    color: "common.white",
                    bgcolor: "primary.main",
                  },
                  "&.active::after": {
                    ...navBarUnderline["&.active::after"],
                    bgcolor: alpha("#ffffff", 0.9),
                  },
                }}
              >
                Dashboard
              </Button>

              <Button
                component={NavLink}
                to="/news"
                end={false}
                size="small"
                sx={{
                  ...navBarUnderline,
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  px: 1.25,
                  py: 0.5,
                  "&::after": {
                    ...navBarUnderline["&::after"],
                    bgcolor: "primary.light",
                  },
                  "&.active": {
                    color: "common.white",
                    bgcolor: "primary.main",
                  },
                  "&.active::after": {
                    ...navBarUnderline["&.active::after"],
                    bgcolor: alpha("#ffffff", 0.9),
                  },
                }}
              >
                News
              </Button>

              <Button
                component={NavLink}
                to="/media"
                end={true}
                size="small"
                sx={{
                  ...navBarUnderline,
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  px: 1.25,
                  py: 0.5,
                  "&::after": {
                    ...navBarUnderline["&::after"],
                    bgcolor: "primary.light",
                  },
                  "&.active": {
                    color: "common.white",
                    bgcolor: "primary.main",
                  },
                  "&.active::after": {
                    ...navBarUnderline["&.active::after"],
                    bgcolor: alpha("#ffffff", 0.9),
                  },
                }}
              >
                Media
              </Button>

              {navGroups.map((group) => {
                const active = groupIsActive(group, location.pathname);
                return (
                  <Button
                    key={group.id}
                    id={`nav-group-trigger-${group.id}`}
                    type="button"
                    size="small"
                    aria-haspopup="true"
                    aria-expanded={navMenuGroupId === group.id}
                    aria-controls="nav-group-dropdown"
                    endIcon={<KeyboardArrowDown sx={{ fontSize: 18 }} />}
                    onClick={(e) => {
                      if (navMenuGroupId === group.id) {
                        closeNavMenu();
                      } else {
                        openNavMenu(group.id, e);
                      }
                    }}
                    sx={{
                      ...navBarUnderline,
                      color: active ? "common.white" : "text.secondary",
                      bgcolor: active ? "primary.main" : "transparent",
                      whiteSpace: "nowrap",
                      px: 1.25,
                      py: 0.5,
                      "&::after": {
                        ...navBarUnderline["&::after"],
                        bgcolor: alpha("#ffffff", 0.92),
                        transform: active
                          ? "translateX(-50%) scaleX(1)"
                          : "translateX(-50%) scaleX(0)",
                      },
                      "&:hover": {
                        bgcolor: active ? "primary.dark" : "action.hover",
                      },
                      "@media (prefers-reduced-motion: reduce)": {
                        "&::after": { transition: "none" },
                      },
                    }}
                  >
                    {group.label}
                  </Button>
                );
              })}
            </Box>

            <Menu
              id="nav-group-dropdown"
              anchorEl={navMenuAnchor}
              open={Boolean(navMenuGroupId)}
              onClose={closeNavMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: { minWidth: 200, mt: 0.5 },
                },
              }}
            >
              {navGroups
                .find((g) => g.id === navMenuGroupId)
                ?.items.map((item) => (
                  <MenuItem
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={closeNavMenu}
                    selected={pathMatchesNavItem(location.pathname, item.to)}
                    sx={{ py: 1 }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
            </Menu>

            <IconButton
              type="button"
              onClick={toggleMode}
              aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              sx={{
                color: "text.secondary",
                flexShrink: 0,
                ml: { xs: "auto", md: 0.5 },
              }}
            >
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>

            <IconButton
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              aria-controls="app-mobile-nav"
              onClick={() => setIsMenuOpen(true)}
              sx={{ ml: { xs: 0.25, md: "auto" }, display: { xs: "inline-flex", md: "none" }, color: "text.secondary" }}
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
        <Stack sx={{ width: 280, maxWidth: "85vw", p: 2, gap: 0 }}>
          <Button
            component={NavLink}
            to="/dashboard"
            end
            onClick={() => setIsMenuOpen(false)}
            sx={{
              justifyContent: "flex-start",
              color: "text.primary",
              py: 1,
              borderLeft: 3,
              borderLeftStyle: "solid",
              borderLeftColor: "transparent",
              borderRadius: 0,
              pl: 2,
              transition: "border-color 0.28s ease, padding-left 0.28s ease",
              "&.active": {
                color: "primary.main",
                fontWeight: 700,
                borderLeftColor: "primary.main",
                pl: 1.75,
              },
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            Dashboard
          </Button>
          <Button
            component={NavLink}
            to="/news"
            end={false}
            onClick={() => setIsMenuOpen(false)}
            sx={{
              justifyContent: "flex-start",
              color: "text.primary",
              py: 1,
              borderLeft: 3,
              borderLeftStyle: "solid",
              borderLeftColor: "transparent",
              borderRadius: 0,
              pl: 2,
              transition: "border-color 0.28s ease, padding-left 0.28s ease",
              "&.active": {
                color: "primary.main",
                fontWeight: 700,
                borderLeftColor: "primary.main",
                pl: 1.75,
              },
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            News
          </Button>
          <Button
            component={NavLink}
            to="/media"
            end
            onClick={() => setIsMenuOpen(false)}
            sx={{
              justifyContent: "flex-start",
              color: "text.primary",
              py: 1,
              borderLeft: 3,
              borderLeftStyle: "solid",
              borderLeftColor: "transparent",
              borderRadius: 0,
              pl: 2,
              transition: "border-color 0.28s ease, padding-left 0.28s ease",
              "&.active": {
                color: "primary.main",
                fontWeight: 700,
                borderLeftColor: "primary.main",
                pl: 1.75,
              },
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            Media
          </Button>
          <Divider sx={{ my: 1 }} />
          {navGroups.map((group) => (
            <Box key={group.id} sx={{ mb: 1.5 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", px: 1, mb: 0.5, letterSpacing: 1.2 }}
              >
                {group.label}
              </Typography>
              <Stack spacing={0.25}>
                {group.items.map((item) => (
                  <Button
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    sx={{
                      justifyContent: "flex-start",
                      color: "text.primary",
                      py: 1,
                      pl: 2,
                      borderLeft: 3,
                      borderLeftStyle: "solid",
                      borderLeftColor: "transparent",
                      borderRadius: 0,
                      transition: "border-color 0.28s ease, padding-left 0.28s ease",
                      "&.active": {
                        color: "primary.main",
                        fontWeight: 700,
                        borderLeftColor: "primary.main",
                        pl: 1.75,
                      },
                      "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Button
            component={NavLink}
            to="/acknowledgements"
            onClick={() => setIsMenuOpen(false)}
            sx={{
              justifyContent: "flex-start",
              color: "text.primary",
              py: 1,
              borderLeft: 3,
              borderLeftStyle: "solid",
              borderLeftColor: "transparent",
              borderRadius: 0,
              pl: 2,
              transition: "border-color 0.28s ease, padding-left 0.28s ease",
              "&.active": {
                color: "primary.main",
                fontWeight: 700,
                borderLeftColor: "primary.main",
                pl: 1.75,
              },
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            Acknowledgements
          </Button>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
              Theme
            </Typography>
            <IconButton
              type="button"
              size="small"
              onClick={() => {
                toggleMode();
              }}
              aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {mode === "dark" ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </IconButton>
          </Stack>
        </Stack>
      </Drawer>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box
          key={location.pathname}
          sx={{
            flex: 1,
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
            },
            animation: `${routeEnter} 340ms cubic-bezier(0.22, 1, 0.36, 1) both`,
          }}
        >
          <Suspense fallback={<PageRouteFallback />}>
            <Routes>
              {/* App entry: send root URL straight to Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/news/article/:articleKey" element={<NewsArticle />} />
              <Route path="/news" element={<News />} />
              <Route path="/media" element={<Media />} />
              <Route path="/drivers/:driverNumber" element={<DriverDetail />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/constructors/team/:teamSlug" element={<ConstructorDetail />} />
              <Route path="/constructors" element={<Constructors />} />
              <Route path="/races/:meetingKey" element={<RaceMeetingSessions />} />
              <Route
                path="/races/:meetingKey/session/:sessionKey/laps"
                element={<SessionLaps />}
              />
              <Route path="/races" element={<Races />} />
              <Route path="/team-drivers" element={<TeamDriverMapping />} />
              <Route path="/countdown" element={<CountdownTimer />} />
              <Route path="/profiles" element={<DriverProfiles />} />
              <Route path="/results" element={<RaceResults />} />
              <Route path="/head-to-head" element={<HeadToHeadComparison />} />
              <Route path="/acknowledgements" element={<Acknowledgements />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>

      <SiteFooter />
    </Box>
  );
}
