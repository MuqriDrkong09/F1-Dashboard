import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DriverStandingsTable from "./DriverStandingsTable";

const standings = [
  {
    position: 2,
    fullName: "Driver B",
    driverNumber: 22,
    code: "DRB",
    constructor: "Team B",
    points: 90,
    wins: 0,
    teamColor: "#123456",
    headshotUrl: "",
  },
  {
    position: 1,
    fullName: "Driver A",
    driverNumber: 11,
    code: "DRA",
    constructor: "Team A",
    points: 100,
    wins: 2,
    teamColor: "#654321",
    headshotUrl: "",
  },
];

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("DriverStandingsTable", () => {
  it("renders rows and fallback for wins", () => {
    renderWithRouter(<DriverStandingsTable standings={standings} />);

    expect(screen.getByText("Driver A")).toBeInTheDocument();
    expect(screen.getByText("Driver B")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("sorts by points when clicking points header", () => {
    renderWithRouter(<DriverStandingsTable standings={standings} />);
    fireEvent.click(screen.getByText("Points"));

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Driver A");
  });

  it("links driver and team cells to detail routes", () => {
    renderWithRouter(<DriverStandingsTable standings={standings} />);

    expect(screen.getByRole("link", { name: /Driver A/i })).toHaveAttribute(
      "href",
      "/drivers/11",
    );
    expect(screen.getByRole("link", { name: /Team A/i })).toHaveAttribute(
      "href",
      "/constructors/team/Team%20A",
    );
  });
});
