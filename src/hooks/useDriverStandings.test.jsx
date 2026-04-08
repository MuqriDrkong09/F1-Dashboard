import { act, renderHook, waitFor } from "@testing-library/react";
import { useDriverStandings } from "./useDriverStandings";
import {
  getDriversBySession,
  getLatestDriverChampionship,
} from "../services/openf1";

jest.mock("../services/openf1", () => ({
  getLatestDriverChampionship: jest.fn(),
  getDriversBySession: jest.fn(),
}));

describe("useDriverStandings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mapped standings from OpenF1 responses", async () => {
    getLatestDriverChampionship.mockResolvedValue([
      {
        session_key: 12345,
        driver_number: 1,
        position_current: 2,
        points_current: 100,
      },
      {
        session_key: 12345,
        driver_number: 4,
        position_current: 1,
        points_current: 110,
      },
    ]);

    getDriversBySession.mockResolvedValue([
      {
        driver_number: 1,
        full_name: "Max VERSTAPPEN",
        name_acronym: "VER",
        team_name: "Red Bull Racing",
        team_colour: "3671C6",
        headshot_url: "https://example.com/max.png",
      },
      {
        driver_number: 4,
        full_name: "Lando NORRIS",
        name_acronym: "NOR",
        team_name: "McLaren",
        team_colour: "FF8700",
        headshot_url: "https://example.com/lando.png",
      },
    ]);

    const { result } = renderHook(() => useDriverStandings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.standings).toHaveLength(2);
    expect(result.current.standings[0]).toMatchObject({
      position: 1,
      points: 110,
      fullName: "Lando Norris",
      code: "NOR",
      constructor: "McLaren",
      teamColor: "#FF8700",
      driverNumber: 4,
    });
  });

  it("returns an error when no championship data is available", async () => {
    getLatestDriverChampionship.mockResolvedValue([]);

    const { result } = renderHook(() => useDriverStandings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(
      "No championship driver data available from OpenF1",
    );
    expect(result.current.standings).toEqual([]);
  });

  it("refetches data when refetch is called", async () => {
    getLatestDriverChampionship.mockResolvedValue([
      {
        session_key: 12345,
        driver_number: 16,
        position_current: 1,
        points_current: 120,
      },
    ]);

    getDriversBySession.mockResolvedValue([
      {
        driver_number: 16,
        full_name: "Charles LECLERC",
        name_acronym: "LEC",
        team_name: "Ferrari",
        team_colour: "DC0000",
      },
    ]);

    const { result } = renderHook(() => useDriverStandings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() =>
      expect(getLatestDriverChampionship).toHaveBeenCalledTimes(2),
    );
  });
});
