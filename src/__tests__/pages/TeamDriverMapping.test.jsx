import { render, screen, waitFor } from "@testing-library/react";
import TeamDriverMapping from "../../pages/TeamDriverMapping";
import {
  getDriversBySession,
  getLatestDriverChampionship,
  getTeamChampionshipBySession,
} from "../../services/openf1";

jest.mock("../../services/openf1", () => ({
  getDriversBySession: jest.fn(),
  getLatestDriverChampionship: jest.fn(),
  getTeamChampionshipBySession: jest.fn(),
}));

describe("TeamDriverMapping page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps drivers under championship teams", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 9 }]);
    getTeamChampionshipBySession.mockResolvedValue([
      {
        team_name: "Team A",
        position_current: 1,
        points_current: 100,
      },
    ]);
    getDriversBySession.mockResolvedValue([
      {
        driver_number: 1,
        full_name: "Driver One",
        name_acronym: "DO",
        team_name: "Team A",
      },
    ]);

    render(<TeamDriverMapping />);

    await waitFor(() => expect(screen.getByText("Team A")).toBeInTheDocument());
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText(/#1 DO/)).toBeInTheDocument();
  });

  it("shows error when session cannot be resolved", async () => {
    getLatestDriverChampionship.mockResolvedValue([]);

    render(<TeamDriverMapping />);

    await waitFor(() =>
      expect(
        screen.getByText("Could not resolve latest session for team mapping"),
      ).toBeInTheDocument(),
    );
  });
});
