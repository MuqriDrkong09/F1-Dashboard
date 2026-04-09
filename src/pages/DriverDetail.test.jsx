import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DriverDetail from "./DriverDetail";
import {
  getDriverBySessionAndNumber,
  getDriversBySession,
  getLatestDriverChampionship,
} from "../services/openf1";

jest.mock("../services/openf1", () => ({
  getLatestDriverChampionship: jest.fn(),
  getDriverBySessionAndNumber: jest.fn(),
  getDriversBySession: jest.fn(),
}));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/drivers/:driverNumber" element={<DriverDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("DriverDetail page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads driver and shows championship chips", async () => {
    getLatestDriverChampionship.mockResolvedValue([
      {
        session_key: 42,
        driver_number: 7,
        position_current: 3,
        points_current: 55,
        wins: 1,
      },
    ]);
    getDriverBySessionAndNumber.mockResolvedValue({
      driver_number: 7,
      full_name: "Test Racer",
      name_acronym: "TR",
      team_name: "Test Team",
      team_colour: "112233",
      headshot_url: "",
      broadcast_name: "T. RACER",
    });

    renderAt("/drivers/7");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Test Racer/i })).toBeInTheDocument(),
    );
    expect(screen.getByText("P3")).toBeInTheDocument();
    expect(screen.getByText("55 pts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Test Team/i })).toHaveAttribute(
      "href",
      "/constructors/team/Test%20Team",
    );
  });

  it("falls back to drivers list when single-driver endpoint returns null", async () => {
    getLatestDriverChampionship.mockResolvedValue([
      { session_key: 1, driver_number: 99, position_current: 20, points_current: 0 },
    ]);
    getDriverBySessionAndNumber.mockResolvedValue(null);
    getDriversBySession.mockResolvedValue([
      { driver_number: 99, full_name: "Fallback Name", team_name: "F1 Team" },
    ]);

    renderAt("/drivers/99");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Fallback Name/i })).toBeInTheDocument(),
    );
  });
});
