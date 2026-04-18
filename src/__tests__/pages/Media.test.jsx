import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Media from "../../pages/Media";

describe("Media page", () => {
  it("renders heading and official outbound links", () => {
    render(
      <MemoryRouter>
        <Media />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /watch and follow formula 1/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Open Formula 1 on YouTube$/i })).toHaveAttribute(
      "href",
      "https://www.youtube.com/@Formula1",
    );
    expect(screen.getByRole("link", { name: /^Open F1 TV$/i })).toHaveAttribute(
      "href",
      "https://www.f1tv.formula1.com/",
    );
  });
});
