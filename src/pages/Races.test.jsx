import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Races from "./Races";
import { getMeetingsByYear } from "../services/openf1";

jest.mock("../services/openf1", () => ({
  getMeetingsByYear: jest.fn(),
}));

describe("Races page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    getMeetingsByYear.mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <Races />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("status", { name: /loading race calendar/i }),
    ).toBeInTheDocument();
  });

  it("renders meetings from API", async () => {
    getMeetingsByYear.mockResolvedValue([
      {
        meeting_key: 1,
        meeting_name: "Bahrain Grand Prix",
        circuit_short_name: "Sakhir",
        country_name: "Bahrain",
        date_start: "2099-03-01T12:00:00Z",
        date_end: "2099-03-03T12:00:00Z",
      },
    ]);

    render(
      <MemoryRouter>
        <Races />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByText(/Round 1: Bahrain Grand Prix/)).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: /view sessions/i })).toHaveAttribute(
      "href",
      "/races/1",
    );
  });
});
