const OPENF1_BASE_URL = "https://api.openf1.org/v1";

async function fetchOpenF1(path, signal) {
  const response = await fetch(`${OPENF1_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`OpenF1 request failed (${response.status}) for ${path}`);
  }

  return response.json();
}

export async function getLatestDriverChampionship(signal) {
  const data = await fetchOpenF1(
    "/championship_drivers?session_key=latest",
    signal,
  );

  return Array.isArray(data) ? data : [];
}

export async function getDriversBySession(sessionKey, signal) {
  const data = await fetchOpenF1(`/drivers?session_key=${sessionKey}`, signal);

  return Array.isArray(data) ? data : [];
}

export async function getMeetingsByYear(year, signal) {
  const data = await fetchOpenF1(`/meetings?year=${year}`, signal);

  return Array.isArray(data) ? data : [];
}

export async function getMeetingByKey(meetingKey, signal) {
  const data = await fetchOpenF1(`/meeting?meeting_key=${meetingKey}`, signal);

  return Array.isArray(data) ? data[0] ?? null : data ?? null;
}

export async function getSessionResults(sessionKey, signal) {
  const data = await fetchOpenF1(
    `/session_result?session_key=${sessionKey}`,
    signal,
  );

  return Array.isArray(data) ? data : [];
}

export async function getTeamChampionshipBySession(sessionKey, signal) {
  const data = await fetchOpenF1(
    `/championship_teams?session_key=${sessionKey}`,
    signal,
  );

  return Array.isArray(data) ? data : [];
}

export async function getSessionsByMeeting(meetingKey, signal) {
  const data = await fetchOpenF1(`/sessions?meeting_key=${meetingKey}`, signal);

  return Array.isArray(data) ? data : [];
}
