import {
  getDriversBySession,
  getLatestDriverChampionship,
  getMeetingByKey,
  getMeetingsByYear,
  getSessionResults,
  getTeamChampionshipBySession,
  resolveMeetingForDetail,
} from "../../services/openf1";

describe("openf1 service", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns meetings by year", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [{ meeting_key: 1 }],
    });

    const result = await getMeetingsByYear(2025);
    expect(result).toEqual([{ meeting_key: 1 }]);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openf1.org/v1/meetings?year=2025",
      { signal: undefined },
    );
  });

  it("appends country_name when provided", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await getMeetingsByYear(2026, undefined, { country_name: "Singapore" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openf1.org/v1/meetings?year=2026&country_name=Singapore",
      { signal: undefined },
    );
  });

  it("returns first item for getMeetingByKey", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [{ meeting_key: 1219 }],
    });

    const result = await getMeetingByKey(1219);
    expect(result).toEqual({ meeting_key: 1219 });
  });

  it("resolveMeetingForDetail falls back to meetings list when /meeting 404", async () => {
    fetch.mockImplementation((url) => {
      const u = String(url);
      if (u.includes("/meeting?meeting_key=1282")) {
        return Promise.resolve({
          ok: false,
          status: 404,
          headers: { get: () => null },
        });
      }
      if (u.includes("/meetings?")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { meeting_key: 1282, meeting_name: "Singapore Grand Prix" },
          ],
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const result = await resolveMeetingForDetail(1282);
    expect(result).toEqual({
      meeting_key: 1282,
      meeting_name: "Singapore Grand Prix",
    });
    expect(fetch.mock.calls.some((c) => String(c[0]).includes("/meeting?"))).toBe(
      true,
    );
    expect(fetch.mock.calls.some((c) => String(c[0]).includes("/meetings?"))).toBe(
      true,
    );
  });

  it("resolveMeetingForDetail prefers preferredYears order for meetings fallback", async () => {
    fetch.mockImplementation((url) => {
      const u = String(url);
      if (u.includes("/meeting?")) {
        return Promise.resolve({
          ok: false,
          status: 404,
          headers: { get: () => null },
        });
      }
      if (u.includes("year=2026")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (u.includes("year=2024")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ meeting_key: 77, meeting_name: "Found in 2024" }],
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const result = await resolveMeetingForDetail(77, undefined, {
      preferredYears: [2026, 2024],
    });
    expect(result).toEqual({
      meeting_key: 77,
      meeting_name: "Found in 2024",
    });
  });

  it("resolveMeetingForDetail uses placeholder when meeting is missing everywhere", async () => {
    fetch.mockImplementation((url) => {
      const u = String(url);
      if (u.includes("/meeting?")) {
        return Promise.resolve({
          ok: false,
          status: 404,
          headers: { get: () => null },
        });
      }
      if (u.includes("/meetings?")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const result = await resolveMeetingForDetail(9999);
    expect(result).toEqual({
      meeting_key: 9999,
      meeting_name: "Meeting 9999",
    });
  });

  it("getLatestDriverChampionship skips sessions where championship_drivers returns 404", async () => {
    fetch.mockImplementation((url) => {
      const u = String(url);
      if (u.includes("/sessions?year=2026")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (u.includes("/sessions?year=2025")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              session_key: 200,
              session_type: "Race",
              session_name: "Race",
              date_start: "2025-12-07T13:00:00+00:00",
              date_end: "2025-12-07T15:00:00+00:00",
            },
            {
              session_key: 199,
              session_type: "Race",
              session_name: "Race",
              date_start: "2025-11-23T13:00:00+00:00",
              date_end: "2025-11-23T15:00:00+00:00",
            },
          ],
        });
      }
      if (u.includes("championship_drivers?session_key=200")) {
        return Promise.resolve({
          ok: false,
          status: 404,
          headers: { get: () => null },
        });
      }
      if (u.includes("championship_drivers?session_key=199")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ session_key: 199, position: 2 }],
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const ySpy = jest.spyOn(Date.prototype, "getUTCFullYear").mockReturnValue(2026);
    try {
      await expect(getLatestDriverChampionship()).resolves.toEqual([
        { session_key: 199, position: 2 },
      ]);
    } finally {
      ySpy.mockRestore();
    }
  });

  it("getLatestDriverChampionship resolves session from /sessions then loads standings", async () => {
    fetch.mockImplementation((url) => {
      const u = String(url);
      if (u.includes("/sessions?year=2026")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (u.includes("/sessions?year=2025")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              session_key: 100,
              session_type: "Race",
              session_name: "Race",
              date_start: "2025-12-07T13:00:00+00:00",
              date_end: "2025-12-07T15:00:00+00:00",
            },
          ],
        });
      }
      if (u.includes("championship_drivers?session_key=100")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ session_key: 100, position: 1 }],
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const ySpy = jest
      .spyOn(Date.prototype, "getUTCFullYear")
      .mockReturnValue(2026);
    try {
      await expect(getLatestDriverChampionship()).resolves.toEqual([
        { session_key: 100, position: 1 },
      ]);
      expect(
        fetch.mock.calls.some((c) => String(c[0]).includes("session_key=latest")),
      ).toBe(false);
    } finally {
      ySpy.mockRestore();
    }
  });

  it("getLatestDriverChampionship rethrows non-ok responses from championship fetch", async () => {
    fetch.mockImplementation((url) => {
      const u = String(url);
      if (u.includes("/sessions?year=2026")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (u.includes("/sessions?year=2025")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              session_key: 7,
              session_type: "Race",
              session_name: "Race",
              date_start: "2025-01-01T00:00:00+00:00",
              date_end: "2025-01-01T02:00:00+00:00",
            },
          ],
        });
      }
      if (u.includes("championship_drivers?session_key=7")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          headers: { get: () => null },
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const ySpy = jest.spyOn(Date.prototype, "getUTCFullYear").mockReturnValue(2026);
    try {
      await expect(getLatestDriverChampionship()).rejects.toThrow(
        "OpenF1 request failed (500)",
      );
    } finally {
      ySpy.mockRestore();
    }
  });

  it("retries once on 429 then succeeds", async () => {
    jest.useFakeTimers();
    const randSpy = jest.spyOn(Math, "random").mockReturnValue(0);
    const headers429 = { get: () => null };
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: headers429,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const promise = getMeetingsByYear(2024);
    await jest.runAllTimersAsync();
    await expect(promise).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
    randSpy.mockRestore();
    jest.useRealTimers();
  });

  it("normalizes non-array responses to arrays where expected", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await expect(getDriversBySession(123)).resolves.toEqual([]);
    await expect(getSessionResults(123)).resolves.toEqual([]);
    await expect(getTeamChampionshipBySession(123)).resolves.toEqual([]);
  });
});
