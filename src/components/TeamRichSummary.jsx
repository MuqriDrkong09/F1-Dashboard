import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Constructor / team block for tooltips (standings + optional driver roster).
 */
export default function TeamRichSummary({
  name,
  teamColor,
  position,
  points,
  roster,
}) {
  const rosterList = Array.isArray(roster) ? roster : [];

  return (
    <Stack spacing={0.75} sx={{ maxWidth: 280 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {teamColor ? (
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              flexShrink: 0,
              bgcolor: teamColor,
            }}
          />
        ) : null}
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {name || "Team"}
        </Typography>
      </Stack>

      {position != null && !Number.isNaN(Number(position)) ? (
        <Typography variant="caption" color="text.secondary">
          Constructors: P{position}
          {points != null && !Number.isNaN(Number(points))
            ? ` · ${points} pts`
            : ""}
        </Typography>
      ) : null}

      {rosterList.length > 0 ? (
        <>
          <Typography variant="caption" sx={{ fontWeight: 600, mt: 0.5 }}>
            Drivers
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 0 }}>
            {rosterList.map((d) => (
              <Typography
                key={`${d.number}-${d.name}`}
                component="li"
                variant="caption"
                color="text.secondary"
              >
                #{d.number} {d.name}
                {d.acronym ? ` (${d.acronym})` : ""}
              </Typography>
            ))}
          </Box>
        </>
      ) : null}
    </Stack>
  );
}
