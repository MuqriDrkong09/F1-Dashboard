import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function RaceCard({ raceName, circuit, country, date }) {
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: "background.paper",
        borderColor: "divider",
        transition: "transform 0.2s ease, border-color 0.2s ease",
        "&:hover": { transform: "translateY(-4px)", borderColor: "primary.main" },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {raceName}
          </Typography>
          <Chip label={date} color="success" variant="outlined" size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Circuit:</strong> {circuit}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          <strong>Country:</strong> {country}
        </Typography>
      </CardContent>
    </Card>
  );
}
