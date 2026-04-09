import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Acknowledgements from "../../pages/Acknowledgements";

describe("Acknowledgements page", () => {
  it("renders credits and trademark section", () => {
    render(
      <MemoryRouter>
        <Acknowledgements />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /acknowledgements & recognition/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /openf1 api/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /formula 1® and trademarks/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^OpenF1$/i })).toHaveAttribute(
      "href",
      "https://openf1.org",
    );
  });
});
