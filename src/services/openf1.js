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

/**
 * Single driver row from OpenF1 `/driver?driver_number=&session_key=`.
 * Returns null if the endpoint 404s (falls back to `getDriversBySession` in callers if needed).
 */
export async function getDriverBySessionAndNumber(sessionKey, driverNumber, signal) {
  const n = Number(driverNumber);
  if (!Number.isFinite(n)) return null;

  try {
    const data = await fetchOpenF1(
      `/driver?driver_number=${n}&session_key=${sessionKey}`,
      signal,
    );
    if (Array.isArray(data)) return data[0] ?? null;
    return data ?? null;
  } catch (err) {
    if (err.name === "AbortError") throw err;
    if (String(err.message ?? "").includes("404")) return null;
    throw err;
  }
}

/** Pass `{ country_name: "Singapore" }` as the third argument to match OpenF1 `meetings` filters. */
export async function getMeetingsByYear(year, signal, options = {}) {
  const params = new URLSearchParams({ year: String(year) });
  if (options.country_name != null && String(options.country_name).trim() !== "") {
    params.set("country_name", String(options.country_name).trim());
  }
  const data = await fetchOpenF1(`/meetings?${params.toString()}`, signal);

  return Array.isArray(data) ? data : [];
}

export async function getMeetingByKey(meetingKey, signal) {
  const data = await fetchOpenF1(`/meeting?meeting_key=${meetingKey}`, signal);

  return Array.isArray(data) ? data[0] ?? null : data ?? null;
}

/**
 * Resolves meeting metadata for a detail view. OpenF1 sometimes returns 404 for
 * `/meeting?meeting_key=` even when `sessions?meeting_key=` works; we fall back to
 * `meetings?year=` (see `preferredYears`), then a minimal placeholder.
 */
export async function resolveMeetingForDetail(meetingKey, signal, options = {}) {
  const key = Number(meetingKey);
  if (!Number.isFinite(key)) {
    return null;
  }

  let row = null;
  try {
    row = await getMeetingByKey(key, signal);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    const is404 = /\(\s*404\s*\)/.test(String(err.message ?? ""));
    if (!is404) throw err;
  }

  if (row) return row;

  const currentYear = new Date().getUTCFullYear();
  const preferred = Array.isArray(options.preferredYears)
    ? options.preferredYears
        .map((y) => Number(y))
        .filter((y) => Number.isFinite(y))
    : [];
  const fallbackYears =
    preferred.length > 0
      ? [...new Set(preferred)]
      : [currentYear, currentYear - 1];

  for (const year of fallbackYears) {
    const meetings = await getMeetingsByYear(year, signal);
    const hit = meetings.find((m) => Number(m.meeting_key) === key);
    if (hit) return hit;
  }

  return {
    meeting_key: key,
    meeting_name: `Meeting ${key}`,
  };
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
