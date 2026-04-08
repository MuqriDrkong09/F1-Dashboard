import { useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
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
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Constructors from "./pages/Constructors";
import Races from "./pages/Races";
import CountdownTimer from "./pages/CountdownTimer";
import DriverProfiles from "./pages/DriverProfiles";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/drivers", label: "Drivers" },
  { to: "/constructors", label: "Constructors" },
  { to: "/races", label: "Races" },
  { to: "/countdown", label: "Countdown" },
  { to: "/profiles", label: "Profiles" },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", backdropFilter: "blur(8px)" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <Typography
              variant="subtitle2"
              sx={{ letterSpacing: 3, textTransform: "uppercase", color: "primary.main", fontWeight: 700 }}
            >
              F1 Dashboard
            </Typography>

            <Box sx={{ ml: "auto", display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  sx={{
                    color: "text.secondary",
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
              onClick={() => setIsMenuOpen(true)}
              sx={{ ml: "auto", display: { xs: "inline-flex", md: "none" }, color: "text.secondary" }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <Stack sx={{ width: 220, p: 2, gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              sx={{
                justifyContent: "flex-start",
                color: "text.primary",
                "&.active": { color: "primary.main", fontWeight: 700 },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Drawer>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/constructors" element={<Constructors />} />
        <Route path="/races" element={<Races />} />
        <Route path="/countdown" element={<CountdownTimer />} />
        <Route path="/profiles" element={<DriverProfiles />} />
      </Routes>
    </Box>
  );
}
