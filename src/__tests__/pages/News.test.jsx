import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import News from "../../pages/News";
import { createAppTheme } from "../../theme";
import { searchFormulaOneNews } from "../../services/gnews";

jest.mock("../../services/gnews", () => ({
  searchFormulaOneNews: jest.fn(),
}));

describe("News page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders articles from GNews search", async () => {
    searchFormulaOneNews.mockResolvedValue([
      {
        title: "F1 headline",
        description: "Teaser",
        content: "",
        url: "https://news.test/a",
        image: null,
        publishedAt: null,
        sourceName: "Paper",
        sourceUrl: null,
      },
    ]);

    render(
      <ThemeProvider theme={createAppTheme("light")}>
        <MemoryRouter>
          <News />
        </MemoryRouter>
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByText("F1 headline")).toBeInTheDocument());
    expect(screen.getByText("Teaser")).toBeInTheDocument();
  });
});
