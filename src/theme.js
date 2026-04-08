import { createTheme } from "@mui/material/styles";

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
});

export default theme;
