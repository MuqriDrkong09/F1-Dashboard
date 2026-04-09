import { alpha, createTheme } from "@mui/material/styles";

const cardHoverOverrides = {
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
};

/**
 * @param {"light" | "dark"} mode
 */
export function createAppTheme(mode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#ef4444",
      },
      ...(isDark
        ? {
            background: {
              default: "#020617",
              paper: "#0f172a",
            },
          }
        : {
            background: {
              default: "#f1f5f9",
              paper: "#ffffff",
            },
            text: {
              primary: "#0f172a",
              secondary: "#475569",
            },
          }),
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: cardHoverOverrides,
    },
  });
}
