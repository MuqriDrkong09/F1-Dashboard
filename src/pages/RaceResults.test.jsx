import { render, screen, waitFor } from "@testing-library/react";
import RaceResults from "./RaceResults";
import {
  getDriversBySession,
  getLatestDriverChampionship,
  getSessionResults,
} from "../services/openf1";

jest.mock("../services/openf1", () => ({
  getDriversBySession: jest.fn(),
  getLatestDriverChampionship: jest.fn(),
  getSessionResults: jest.fn(),
}));

describe("RaceResults page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders podium and classification table", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 42 }]);
    getSessionResults.mockResolvedValue([
      {
        driver_number: 7,
        position: 1,
        number_of_laps: 50,
        gap_to_leader: 0,
        duration: 5000.123,
      },
      {
        driver_number: 44,
        position: 2,
        number_of_laps: 50,
        gap_to_leader: 1.5,
        duration: 5001.0,
      },
    ]);
    getDriversBySession.mockResolvedValue([
      { driver_number: 7, full_name: "Driver One", team_name: "Team A" },
      { driver_number: 44, full_name: "Driver Two", team_name: "Team B" },
    ]);

    render(<RaceResults />);

    await waitFor(() => expect(screen.getByText("Podium")).toBeInTheDocument());
    expect(
      screen.getByText(/P1: Driver One.*P2: Driver Two/),
    ).toBeInTheDocument();
    expect(screen.getByText("Driver One")).toBeInTheDocument();
    expect(screen.getByText("Leader")).toBeInTheDocument();
  });

  it("renders error when session key cannot be resolved", async () => {
    getLatestDriverChampionship.mockResolvedValue([]);

    render(<RaceResults />);

    await waitFor(() =>
      expect(
        screen.getByText("Could not resolve session key for race results"),
      ).toBeInTheDocument(),
    );
  });
});
