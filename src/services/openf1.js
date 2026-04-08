const OPENF1_BASE_URL = "https://api.openf1.org/v1";

function delay(ms, signal) {
  if (signal?.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function fetchOpenF1(path, signal, attempt = 0) {
  const maxAttempts = 5;
  const response = await fetch(`${OPENF1_BASE_URL}${path}`, { signal });

  if (response.status === 429 && attempt < maxAttempts - 1) {
    const retryAfter = response.headers.get("Retry-After");
    const retrySec = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN;
    const waitMs = Number.isFinite(retrySec)
      ? retrySec * 1000
      : Math.min(500 * 2 ** attempt, 8000);
    await delay(waitMs, signal);
    return fetchOpenF1(path, signal, attempt + 1);
  }

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
