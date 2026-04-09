import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function RaceCard({ raceName, circuit, country, date, meetingKey }) {
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: "background.paper",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
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
      {meetingKey != null && meetingKey !== "" && (
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Button
            component={RouterLink}
            to={`/races/${meetingKey}`}
            size="small"
            variant="outlined"
            fullWidth
          >
            View sessions
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
