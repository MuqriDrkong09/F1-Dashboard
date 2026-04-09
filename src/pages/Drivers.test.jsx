import { fireEvent, render, screen } from "@testing-library/react";
import Drivers from "./Drivers";
import { useDriverStandings } from "../hooks/useDriverStandings";

jest.mock("../hooks/useDriverStandings", () => ({
  useDriverStandings: jest.fn(),
}));

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => <div>line</div>,
  XAxis: () => <div>x-axis</div>,
  YAxis: () => <div>y-axis</div>,
  CartesianGrid: () => <div>grid</div>,
  Tooltip: () => <div>tooltip</div>,
}));

describe("Drivers page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    useDriverStandings.mockReturnValue({
      standings: [],
      isLoading: true,
      error: null,
      lastUpdated: null,
      refetch: jest.fn(),
    });

    render(<Drivers />);
    expect(
      screen.getByRole("status", { name: /loading standings/i }),
    ).toBeInTheDocument();
  });

  it("shows error and retries", () => {
    const refetch = jest.fn();
    useDriverStandings.mockReturnValue({
      standings: [],
      isLoading: false,
      error: "Boom",
      lastUpdated: null,
      refetch,
    });

    render(<Drivers />);
    expect(screen.getByText("Could not load standings: Boom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders table/chart content when data exists", () => {
    useDriverStandings.mockReturnValue({
      standings: [
        {
          position: 1,
          points: 120,
          fullName: "Driver A",
          code: "DRA",
          constructor: "Team A",
          wins: 1,
          driverNumber: 11,
          teamColor: "#fff",
        },
      ],
      isLoading: false,
      error: null,
      lastUpdated: "2026-01-01T00:00:00Z",
      refetch: jest.fn(),
    });

    render(<Drivers />);
    expect(screen.getByText("Driver Points Progression")).toBeInTheDocument();
    expect(screen.getByText("Driver Standings Table")).toBeInTheDocument();
    expect(screen.getByText("Driver A")).toBeInTheDocument();
  });
});
