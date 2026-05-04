const OPENF1_BASE_URL = "https://api.openf1.org/v1";

/** OpenF1 returns 429 with "Max 3 requests/second" — stay slightly under with spacing between request starts. */
const OPENF1_MIN_GAP_MS = 360;

let openF1RequestQueue = Promise.resolve();
let nextOpenF1RequestStartTime = 0;

/**
 * Run `task` after all prior OpenF1 traffic (global FIFO). Used so parallel
 * `Promise.all` / StrictMode double-mount cannot burst faster than the API limit.
 */
function enqueueOpenF1Task(task) {
  const run = openF1RequestQueue.then(() => task());
  openF1RequestQueue = run.then(
    () => {},
    () => {},
  );
  return run;
}

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

async function fetchOpenF1(path, signal) {
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await enqueueOpenF1Task(async () => {
      const now = Date.now();
      const waitMs = Math.max(0, nextOpenF1RequestStartTime - now);
      if (waitMs > 0) {
        await delay(waitMs, signal);
      }
      nextOpenF1RequestStartTime = Date.now() + OPENF1_MIN_GAP_MS;

      return fetch(`${OPENF1_BASE_URL}${path}`, { signal });
    });

    if (response.status === 429 && attempt < maxAttempts - 1) {
      const retryAfter = response.headers.get("Retry-After");
      const retrySec = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN;
      const baseMs = Number.isFinite(retrySec)
        ? retrySec * 1000
        : Math.min(500 * 2 ** attempt, 8000);
      const jitterMs = Math.floor(Math.random() * 350);
      await delay(baseMs + jitterMs, signal);
      continue;
    }

    if (!response.ok) {
      throw new Error(`OpenF1 request failed (${response.status}) for ${path}`);
    }

    return response.json();
  }

  throw new Error(`OpenF1: internal pacing loop exhausted for ${path}`);
}

function isOpenF1NotFoundError(err) {
  return /\(\s*404\s*\)/.test(String(err.message ?? ""));
}

/**
 * Completed Sunday GPs (newest first). OpenF1 may list a session in `/sessions`
 * before `championship_drivers` exists for it (404) — callers should try older keys.
 */
async function listGrandPrixSessionKeysChampionshipCandidates(signal) {
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
  const completed = races.filter((s) => {
    const t = Date.parse(s.date_end ?? s.date_start ?? "");
    return Number.isFinite(t) && t <= now;
  });

  const seen = new Set();
  const ordered = [];
  for (const s of completed) {
    const k = Number(s.session_key);
    if (!seen.has(k)) {
      seen.add(k);
      ordered.push(k);
    }
  }

  if (ordered.length === 0 && races[0] != null) {
    ordered.push(Number(races[0].session_key));
  }

  return ordered;
}

export async function getLatestDriverChampionship(signal) {
  const sessionKeys = await listGrandPrixSessionKeysChampionshipCandidates(signal);
  if (sessionKeys.length === 0) {
    throw new Error(
      "OpenF1 championship: no Grand Prix race sessions found to resolve standings.",
    );
  }

  let lastErr = null;
  for (const sessionKey of sessionKeys) {
    try {
      const data = await fetchOpenF1(
        `/championship_drivers?session_key=${sessionKey}`,
        signal,
      );
      return Array.isArray(data) ? data : [];
    } catch (err) {
      if (err.name === "AbortError") throw err;
      if (isOpenF1NotFoundError(err)) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    `OpenF1 championship: no driver standings for recent sessions (${sessionKeys.length} tried). Last error: ${lastErr?.message ?? "unknown"}`,
  );
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

/**
 * All lap rows for a session (sector times, speeds, mini-sector segments).
 * Payload can be large; callers typically filter by `driver_number` in memory.
 */
export async function getLapsBySession(sessionKey, signal) {
  const data = await fetchOpenF1(`/laps?session_key=${sessionKey}`, signal);

  return Array.isArray(data) ? data : [];
}
