import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NewsArticle from "../../pages/NewsArticle";
import { createAppTheme } from "../../theme";
import { searchFormulaOneNews } from "../../services/gnews";
import { encodeArticleRouteKey } from "../../utils/articleRouteKey";

jest.mock("../../services/gnews", () => ({
  searchFormulaOneNews: jest.fn(),
}));

describe("NewsArticle page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads article by URL resolved from route key", async () => {
    const url = "https://news.test/story";
    const key = encodeArticleRouteKey(url);
    searchFormulaOneNews.mockResolvedValue([
      {
        title: "Story title",
        description: "Short",
        content: "<p>Body text</p>",
        url,
        image: null,
        publishedAt: "2025-06-01T12:00:00Z",
        sourceName: "Wire",
        sourceUrl: null,
      },
      {
        title: "Other",
        description: "O",
        content: "",
        url: "https://news.test/other",
        image: null,
        publishedAt: null,
        sourceName: "Wire",
        sourceUrl: null,
      },
    ]);

    render(
      <ThemeProvider theme={createAppTheme("light")}>
        <MemoryRouter initialEntries={[`/news/article/${key}`]}>
          <Routes>
            <Route path="/news/article/:articleKey" element={<NewsArticle />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Story title" })).toBeInTheDocument(),
    );
    expect(screen.getByText("Body text")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Related articles" })).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });
});
