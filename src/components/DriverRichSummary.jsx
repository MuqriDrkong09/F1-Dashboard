import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export const richTooltipSlotProps = {
  tooltip: {
    sx: {
      bgcolor: "background.paper",
      color: "text.primary",
      border: 1,
      borderColor: "divider",
      boxShadow: 3,
      maxWidth: 360,
      p: 1.25,
    },
  },
};

/**
 * Compact driver identity + optional championship / session blocks for tooltips.
 */
export default function DriverRichSummary({
  fullName,
  driverNumber,
  code,
  headshotUrl,
  teamName,
  teamColor,
  broadcastName,
  championshipPosition,
  championshipPoints,
  wins,
  sessionFinish,
}) {
  const initial =
    (code && String(code).slice(0, 1)) ||
    (fullName && String(fullName).slice(0, 1)) ||
    "?";

  const hasChampionship =
    championshipPosition != null &&
    !Number.isNaN(Number(championshipPosition));
  const showWins = wins != null && Number(wins) > 0;

  return (
    <Stack spacing={1} sx={{ maxWidth: 300 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Avatar
          src={headshotUrl || undefined}
          alt={fullName || "Driver"}
          sx={{ width: 40, height: 40, bgcolor: "primary.main", fontSize: 14 }}
        >
          {initial}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {fullName || "Unknown driver"}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            {driverNumber != null ? `#${driverNumber}` : "—"}
            {code ? ` · ${code}` : ""}
          </Typography>
        </Box>
      </Stack>

      {teamName ? (
        <Stack direction="row" spacing={0.75} alignItems="center">
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
          <Typography variant="caption">{teamName}</Typography>
        </Stack>
      ) : null}

      {broadcastName ? (
        <Typography variant="caption" color="text.secondary">
          Broadcast: {broadcastName}
        </Typography>
      ) : null}

      {(hasChampionship || showWins) && <Divider sx={{ my: 0.25 }} />}

      {hasChampionship ? (
        <Typography variant="caption" component="div">
          Championship: P{championshipPosition} · {championshipPoints ?? "—"} pts
          {showWins ? ` · ${wins} win${Number(wins) === 1 ? "" : "s"}` : ""}
        </Typography>
      ) : showWins ? (
        <Typography variant="caption">Wins: {wins}</Typography>
      ) : null}

      {sessionFinish ? (
        <>
          <Divider sx={{ my: 0.25 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            This session
          </Typography>
          <Typography variant="caption" component="div" color="text.secondary">
            Finish P{sessionFinish.position} · {sessionFinish.laps} laps ·{" "}
            {sessionFinish.gap} · {sessionFinish.duration}
          </Typography>
        </>
      ) : null}
    </Stack>
  );
}
