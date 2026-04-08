import {
  getDriversBySession,
  getLatestDriverChampionship,
  getMeetingByKey,
  getMeetingsByYear,
  getSessionResults,
  getTeamChampionshipBySession,
} from "./openf1";

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

  it("returns first item for getMeetingByKey", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [{ meeting_key: 1219 }],
    });

    const result = await getMeetingByKey(1219);
    expect(result).toEqual({ meeting_key: 1219 });
  });

  it("throws for non-ok responses", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    await expect(getLatestDriverChampionship()).rejects.toThrow(
      "OpenF1 request failed (404)",
    );
  });

  it("retries once on 429 then succeeds", async () => {
    jest.useFakeTimers();
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
