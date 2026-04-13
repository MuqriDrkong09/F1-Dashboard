import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import { createAppTheme } from "../../theme";
import {
  getLatestDriverChampionship,
  getMeetingsByYear,
} from "../../services/openf1";
import { searchFormulaOneNews } from "../../services/gnews";

jest.mock("../../services/openf1", () => ({
  getLatestDriverChampionship: jest.fn(),
  getMeetingsByYear: jest.fn(),
}));

jest.mock("../../services/gnews", () => ({
  searchFormulaOneNews: jest.fn(),
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
    searchFormulaOneNews.mockResolvedValue([
      {
        title: "F1 news item",
        description: "Desc",
        content: "",
        url: "https://news.test/x",
        image: null,
        publishedAt: null,
        sourceName: "N",
        sourceUrl: null,
      },
    ]);

    render(
      <ThemeProvider theme={createAppTheme("dark")}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Australian Grand Prix")).toBeInTheDocument(),
    );
    expect(screen.getByText("Albert Park")).toBeInTheDocument();

    const leaderCard = screen.getByText("Championship Leader").closest(".MuiCard-root");
    const pointsCard = screen.getByText("Leader Points").closest(".MuiCard-root");
    await waitFor(() => expect(leaderCard).toHaveTextContent("#16"), { timeout: 2500 });
    await waitFor(() => expect(pointsCard).toHaveTextContent("25 pts"), { timeout: 2500 });

    await waitFor(() => expect(screen.getByText("Latest F1 News")).toBeInTheDocument());
    expect(screen.getByText("F1 news item")).toBeInTheDocument();
  });
});
