import { render, screen, waitFor } from "@testing-library/react";
import HeadToHeadComparison from "../../pages/HeadToHeadComparison";
import {
  getDriversBySession,
  getLatestDriverChampionship,
  getSessionResults,
} from "../../services/openf1";

jest.mock("../../services/openf1", () => ({
  getDriversBySession: jest.fn(),
  getLatestDriverChampionship: jest.fn(),
  getSessionResults: jest.fn(),
}));

describe("HeadToHeadComparison page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders comparison table for two drivers", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 55 }]);
    getDriversBySession.mockResolvedValue([
      { driver_number: 1, full_name: "Alpha Driver", team_name: "Team A" },
      { driver_number: 2, full_name: "Beta Driver", team_name: "Team B" },
    ]);
    getSessionResults.mockResolvedValue([
      {
        driver_number: 1,
        position: 1,
        number_of_laps: 52,
        gap_to_leader: 0,
        duration: 6000,
      },
      {
        driver_number: 2,
        position: 3,
        number_of_laps: 52,
        gap_to_leader: 5.2,
        duration: 6010,
      },
    ]);

    render(<HeadToHeadComparison />);

    await waitFor(() =>
      expect(screen.getByText("Alpha Driver vs Beta Driver")).toBeInTheDocument(),
    );
    expect(screen.getByText("Team A vs Team B")).toBeInTheDocument();
    expect(screen.getByText("Position")).toBeInTheDocument();
  });

  it("renders error when session key cannot be resolved", async () => {
    getLatestDriverChampionship.mockResolvedValue([]);

    render(<HeadToHeadComparison />);

    await waitFor(() =>
      expect(
        screen.getByText("Could not resolve latest session for comparison"),
      ).toBeInTheDocument(),
    );
  });
});
