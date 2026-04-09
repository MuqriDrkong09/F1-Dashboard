import { alpha, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ef4444",
    },
    background: {
      default: "#020617",
      paper: "#0f172a",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          transition: t.transitions.create(["transform", "box-shadow", "border-color"], {
            duration: t.transitions.duration.shorter,
            easing: t.transitions.easing.easeOut,
          }),
          "&:hover": {
            transform: "translateY(-6px) scale(1.02)",
            boxShadow: t.shadows[14],
            borderColor: alpha(t.palette.primary.main, 0.5),
          },
          "@media (prefers-reduced-motion: reduce)": {
            transition: t.transitions.create(["box-shadow", "border-color"], {
              duration: t.transitions.duration.shorter,
            }),
            "&:hover": {
              transform: "none",
            },
          },
        }),
      },
    },
  },
});

export default theme;
