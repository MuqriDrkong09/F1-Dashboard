function normTeamKey(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase();
}

function hasConstructorLabel(row) {
  return row?.team_name != null && String(row.team_name).trim() !== "";
}

/**
 * OpenF1 occasionally returns `championship_teams` with null `team_name` (and sparse positions)
 * while `drivers` + `championship_drivers` still carry recoverable team labels and points.
 *
 * When any row is missing a team label (or the teams list is empty), rebuild standings by
 * summing each driver's `points_current` onto their constructor from session `drivers`.
 */
export function mergeConstructorStandings(teamStandings, drivers, championshipDrivers) {
  const teams = Array.isArray(teamStandings) ? teamStandings : [];
  const roster = Array.isArray(drivers) ? drivers : [];
  const driverPts = Array.isArray(championshipDrivers) ? championshipDrivers : [];

  if (teams.length > 0 && teams.every(hasConstructorLabel)) {
    return teams;
  }

  const numToDriver = new Map(roster.map((d) => [Number(d.driver_number), d]));

  const displayByKey = new Map();
  for (const d of roster) {
    const key = normTeamKey(d.team_name);
    if (!key) continue;
    if (!displayByKey.has(key)) {
      displayByKey.set(key, String(d.team_name).trim());
    }
  }

  const pointsByKey = new Map();
  for (const row of driverPts) {
    const driver = numToDriver.get(Number(row.driver_number));
    const key = normTeamKey(driver?.team_name);
    if (!key) continue;
    const add = Number(row.points_current ?? 0);
    pointsByKey.set(key, (pointsByKey.get(key) ?? 0) + add);
  }

  for (const d of roster) {
    const key = normTeamKey(d.team_name);
    if (!key) continue;
    if (!pointsByKey.has(key)) {
      pointsByKey.set(key, 0);
    }
  }

  const meeting_key = teams[0]?.meeting_key ?? roster[0]?.meeting_key;
  const session_key = teams[0]?.session_key ?? roster[0]?.session_key;

  const ranked = [...pointsByKey.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return String(a[0]).localeCompare(String(b[0]));
    })
    .map(([key, points], index) => ({
      meeting_key,
      session_key,
      team_name: displayByKey.get(key) ?? key,
      position_start: null,
      position_current: index + 1,
      points_start: null,
      points_current: points,
    }));

  if (ranked.length > 0) {
    return ranked;
  }

  return teams;
}
