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

function isOpenF1NotFoundError(err) {
  return /\(\s*404\s*\)/.test(String(err.message ?? ""));
}

/**
 * OpenF1 no longer reliably serves `championship_*` with `session_key=latest`.
 * We resolve the most recent completed Sunday race from `/sessions` and use
 * that numeric key (same key callers use from `standings[0].session_key`).
 */
async function resolveLatestGrandPrixSessionKeyForChampionship(signal) {
  const currentYear = new Date().getUTCFullYear();
  const years = [currentYear, currentYear - 1];
  const lists = await Promise.all(
    years.map((year) =>
      fetchOpenF1(`/sessions?year=${year}&session_type=Race`, signal).then(
        (data) => (Array.isArray(data) ? data : []),
      ),
    ),
  );
  const races = lists
    .flat()
    .filter(
      (s) =>
        s.session_type === "Race" &&
        s.session_name === "Race" &&
        Number.isFinite(Number(s.session_key)),
    );
  races.sort((a, b) =>
    String(b.date_end ?? "").localeCompare(String(a.date_end ?? "")),
  );

  const now = Date.now();
  const completed = races.find((s) => {
    const t = Date.parse(s.date_end ?? s.date_start ?? "");
    return Number.isFinite(t) && t <= now;
  });
  const pick = completed ?? races[0];
  return pick != null ? Number(pick.session_key) : null;
}

export async function getLatestDriverChampionship(signal) {
  let data;
  try {
    data = await fetchOpenF1(
      "/championship_drivers?session_key=latest",
      signal,
    );
  } catch (err) {
    if (err.name === "AbortError") throw err;
    if (!isOpenF1NotFoundError(err)) throw err;
    data = null;
  }

  const first = Array.isArray(data) ? data : [];
  if (first.length > 0) return first;

  const sessionKey = await resolveLatestGrandPrixSessionKeyForChampionship(
    signal,
  );
  if (sessionKey == null) {
    throw new Error(
      "OpenF1 championship: no completed Grand Prix session found to resolve standings.",
    );
  }

  const fallback = await fetchOpenF1(
    `/championship_drivers?session_key=${sessionKey}`,
    signal,
  );
  return Array.isArray(fallback) ? fallback : [];
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
