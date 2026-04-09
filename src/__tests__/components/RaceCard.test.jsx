import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RaceCard from "../../components/RaceCard";

describe("RaceCard", () => {
  it("renders race details", () => {
    render(
      <MemoryRouter>
        <RaceCard
          raceName="Round 1: Bahrain Grand Prix"
          circuit="Bahrain International Circuit"
          country="Bahrain"
          date="03/02/2026"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Round 1: Bahrain Grand Prix")).toBeInTheDocument();
    expect(screen.getByText(/Circuit:/)).toBeInTheDocument();
    expect(screen.getByText(/Bahrain International Circuit/)).toBeInTheDocument();
    expect(screen.getByText(/Country:/)).toBeInTheDocument();
    expect(screen.getByText("Bahrain")).toBeInTheDocument();
    expect(screen.getByText("03/02/2026")).toBeInTheDocument();
  });
});
