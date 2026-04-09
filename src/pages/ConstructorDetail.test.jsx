import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ConstructorDetail from "./ConstructorDetail";
import {
  getDriversBySession,
  getLatestDriverChampionship,
  getTeamChampionshipBySession,
} from "../services/openf1";

jest.mock("../services/openf1", () => ({
  getLatestDriverChampionship: jest.fn(),
  getTeamChampionshipBySession: jest.fn(),
  getDriversBySession: jest.fn(),
}));

function renderTeam(name) {
  const path = `/constructors/team/${encodeURIComponent(name)}`;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/constructors/team/:teamSlug" element={<ConstructorDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ConstructorDetail page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows team summary and roster links", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 5 }]);
    getTeamChampionshipBySession.mockResolvedValue([
      { team_name: "Acme F1", points_current: 200, position_current: 1 },
    ]);
    getDriversBySession.mockResolvedValue([
      {
        driver_number: 10,
        full_name: "Driver Ten",
        name_acronym: "DT",
        team_name: "Acme F1",
        headshot_url: "",
        team_colour: "abcdef",
      },
      {
        driver_number: 11,
        full_name: "Driver Eleven",
        name_acronym: "DE",
        team_name: "Acme F1",
        headshot_url: "",
        team_colour: "abcdef",
      },
    ]);

    renderTeam("Acme F1");

    await waitFor(() => expect(screen.getByText("Acme F1")).toBeInTheDocument());
    expect(screen.getByText("200 pts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Driver Ten/i })).toHaveAttribute(
      "href",
      "/drivers/10",
    );
  });

  it("shows warning when team is unknown", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 1 }]);
    getTeamChampionshipBySession.mockResolvedValue([
      { team_name: "Other", points_current: 1, position_current: 2 },
    ]);
    getDriversBySession.mockResolvedValue([]);

    renderTeam("Missing Team");

    await waitFor(() =>
      expect(screen.getByText(/No constructor row matched/i)).toBeInTheDocument(),
    );
  });
});
