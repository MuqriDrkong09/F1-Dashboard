import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DriverProfiles from "../../pages/DriverProfiles";
import {
  getDriversBySession,
  getLatestDriverChampionship,
} from "../../services/openf1";

jest.mock("../../services/openf1", () => ({
  getDriversBySession: jest.fn(),
  getLatestDriverChampionship: jest.fn(),
}));

describe("DriverProfiles page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders driver cards from API", async () => {
    getLatestDriverChampionship.mockResolvedValue([{ session_key: 999 }]);
    getDriversBySession.mockResolvedValue([
      {
        driver_number: 1,
        full_name: "Test Driver",
        name_acronym: "TD",
        team_name: "Test Team",
        team_colour: "ff0000",
        headshot_url: "",
      },
    ]);

    render(
      <MemoryRouter>
        <DriverProfiles />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Test Driver")).toBeInTheDocument());
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("Test Team")).toBeInTheDocument();
    expect(screen.getAllByText("TD").length).toBeGreaterThanOrEqual(1);
  });

  it("renders error when session key cannot be resolved", async () => {
    getLatestDriverChampionship.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <DriverProfiles />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.getByText("Could not resolve session key for driver profiles"),
      ).toBeInTheDocument(),
    );
  });
});
