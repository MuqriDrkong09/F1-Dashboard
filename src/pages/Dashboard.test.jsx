import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";
import {
  getLatestDriverChampionship,
  getMeetingsByYear,
} from "../services/openf1";

jest.mock("../services/openf1", () => ({
  getLatestDriverChampionship: jest.fn(),
  getMeetingsByYear: jest.fn(),
}));

describe("Dashboard page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders API-powered stats", async () => {
    getMeetingsByYear.mockResolvedValue([
      {
        meeting_name: "Australian Grand Prix",
        circuit_short_name: "Albert Park",
        date_start: "2099-03-10T10:00:00Z",
        date_end: "2099-03-11T10:00:00Z",
      },
    ]);
    getLatestDriverChampionship.mockResolvedValue([
      { driver_number: 16, position_current: 1, points_current: 25 },
    ]);

    render(<Dashboard />);

    await waitFor(() =>
      expect(screen.getByText("Australian Grand Prix")).toBeInTheDocument(),
    );
    expect(screen.getByText("Albert Park")).toBeInTheDocument();
    expect(screen.getByText("#16")).toBeInTheDocument();
    expect(screen.getByText("25 pts")).toBeInTheDocument();
  });
});
