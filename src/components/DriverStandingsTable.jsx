import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import DriverRichSummary, { richTooltipSlotProps } from "./DriverRichSummary";
import TeamRichSummary from "./TeamRichSummary";

export default function DriverStandingsTable({ standings }) {
  const [sortBy, setSortBy] = useState("position");
  const [sortOrder, setSortOrder] = useState("asc");

  const onSort = (column) => {
    if (sortBy === column) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(column);
    setSortOrder(column === "points" ? "desc" : "asc");
  };

  const sortedStandings = useMemo(() => {
    const rows = [...standings];
    const direction = sortOrder === "asc" ? 1 : -1;

    rows.sort((a, b) => {
      if (sortBy === "position") return (a.position - b.position) * direction;
      if (sortBy === "points") return (a.points - b.points) * direction;
      return a.fullName.localeCompare(b.fullName) * direction;
    });

    return rows;
  }, [standings, sortBy, sortOrder]);

  return (
    <TableContainer
      variant="outlined"
      sx={{ borderRadius: 2, borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortBy === "position"}
                direction={sortBy === "position" ? sortOrder : "asc"}
                onClick={() => onSort("position")}
              >
                Position
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === "driver"}
                direction={sortBy === "driver" ? sortOrder : "asc"}
                onClick={() => onSort("driver")}
              >
                Driver
              </TableSortLabel>
            </TableCell>
            <TableCell>Team</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === "points"}
                direction={sortBy === "points" ? sortOrder : "desc"}
                onClick={() => onSort("points")}
              >
                Points
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Wins</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedStandings.map((driver) => (
            <TableRow
              key={`${driver.position}-${driver.fullName}`}
              hover
              sx={{ "&:last-child td": { borderBottom: 0 } }}
            >
              <TableCell sx={{ color: "primary.main", fontWeight: 600 }}>
                {driver.position}
              </TableCell>
              <TableCell>
                <Tooltip
                  enterTouchDelay={0}
                  slotProps={richTooltipSlotProps}
                  title={
                    <DriverRichSummary
                      fullName={driver.fullName}
                      driverNumber={driver.driverNumber}
                      code={driver.code}
                      headshotUrl={driver.headshotUrl}
                      teamName={driver.constructor}
                      teamColor={driver.teamColor}
                      broadcastName={driver.broadcastName}
                      championshipPosition={driver.position}
                      championshipPoints={driver.points}
                      wins={driver.wins}
                    />
                  }
                >
                  <Box
                    component={RouterLink}
                    to={`/drivers/${driver.driverNumber}`}
                    sx={{
                      display: "inline-flex",
                      maxWidth: "100%",
                      cursor: "pointer",
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { opacity: 0.92 },
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        src={driver.headshotUrl}
                        alt={driver.fullName}
                        sx={{ width: 30, height: 30, bgcolor: "primary.main", fontSize: 12 }}
                      >
                        {driver.code || driver.fullName.slice(0, 1)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{driver.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{driver.driverNumber} {driver.code ? `• ${driver.code}` : ""}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip
                  enterTouchDelay={0}
                  slotProps={richTooltipSlotProps}
                  title={
                    <TeamRichSummary
                      name={driver.constructor}
                      teamColor={driver.teamColor}
                    />
                  }
                >
                  <Box
                    component={RouterLink}
                    to={`/constructors/team/${encodeURIComponent(driver.constructor)}`}
                    sx={{
                      display: "inline-flex",
                      maxWidth: "100%",
                      cursor: "pointer",
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { opacity: 0.92 },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {driver.teamColor && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: driver.teamColor,
                          }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {driver.constructor}
                      </Typography>
                    </Stack>
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell align="right" sx={{ color: "success.main", fontWeight: 700 }}>
                {driver.points}
              </TableCell>
              <TableCell align="right" sx={{ color: "text.secondary" }}>
                {driver.wins > 0 ? (
                  driver.wins
                ) : (
                  <Chip label="N/A" size="small" variant="outlined" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
