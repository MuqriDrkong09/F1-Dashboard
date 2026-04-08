import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App routing shell", () => {
  it("renders navbar links", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Drivers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Constructors").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Races").length).toBeGreaterThan(0);
  });
});
