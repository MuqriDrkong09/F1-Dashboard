import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Constructors from "../../pages/Constructors";
import {
  getChampionshipDriversBySession,
  getDriversBySession,
  getLatestDriverChampionship,
  getTeamChampionshipBySession,
} from "../../services/openf1";

jest.mock("../../services/openf1", () => ({
  getChampionshipDriversBySession: jest.fn(),
  getDriversBySession: jest.fn(),
  getLatestDriverChampionship: jest.fn(),
  getTeamChampionshipBySession: jest.fn(),
}));

describe("Constructors page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDriversBySession.mockResolvedValue([]);
    getChampionshipDriversBySession.mockResolvedValue([]);
  });

  it("renders constructors from API", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 123 }]);
    getTeamChampionshipBySession.mockResolvedValue([
      { team_name: "Team A", points_current: 120, position_current: 1 },
    ]);

    render(
      <MemoryRouter>
        <Constructors />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/P1 - Team A/)).toBeInTheDocument());
    expect(screen.getByText("120 pts")).toBeInTheDocument();
  });

  it("uses driver championship totals when constructor API omits team_name", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 999 }]);
    getTeamChampionshipBySession.mockResolvedValue([
      {
        meeting_key: 10,
        session_key: 999,
        team_name: null,
        position_current: null,
        points_current: 0,
      },
    ]);
    getDriversBySession.mockResolvedValue([
      { driver_number: 5, team_name: "Acme F1", team_colour: "aabbcc" },
    ]);
    getChampionshipDriversBySession.mockResolvedValue([
      { driver_number: 5, points_current: 42 },
    ]);

    render(
      <MemoryRouter>
        <Constructors />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/P1 - Acme F1/)).toBeInTheDocument());
    expect(screen.getByText("42 pts")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    getLatestDriverChampionship.mockResolvedValue([]);
    getDriversBySession.mockResolvedValue([]);
    getTeamChampionshipBySession.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Constructors />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.getByText("Could not resolve latest race session"),
      ).toBeInTheDocument(),
    );
  });
});
