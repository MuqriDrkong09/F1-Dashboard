import { render, screen, waitFor } from "@testing-library/react";
import Constructors from "./Constructors";
import {
  getLatestDriverChampionship,
  getTeamChampionshipBySession,
} from "../services/openf1";

jest.mock("../services/openf1", () => ({
  getLatestDriverChampionship: jest.fn(),
  getTeamChampionshipBySession: jest.fn(),
}));

describe("Constructors page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders constructors from API", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 123 }]);
    getTeamChampionshipBySession.mockResolvedValue([
      { team_name: "Team A", points_current: 120, position_current: 1 },
    ]);

    render(<Constructors />);

    await waitFor(() => expect(screen.getByText(/P1 - Team A/)).toBeInTheDocument());
    expect(screen.getByText("120 pts")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    getLatestDriverChampionship.mockResolvedValue([]);
    getTeamChampionshipBySession.mockResolvedValue([]);

    render(<Constructors />);

    await waitFor(() =>
      expect(
        screen.getByText("Could not resolve latest race session"),
      ).toBeInTheDocument(),
    );
  });
});
