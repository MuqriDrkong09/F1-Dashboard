import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { AppThemeProvider } from "../context/AppThemeProvider";

describe("App routing shell", () => {
  it("renders grouped navbar (Dashboard + Schedule, Standings, Explore)", async () => {
    render(
      <AppThemeProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <App />
        </MemoryRouter>
      </AppThemeProvider>,
    );

    expect(screen.getByText("F1 Dashboard")).toBeInTheDocument();
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /^Schedule$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Standings$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Explore$/ })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading page…")).not.toBeInTheDocument();
    });
  });
});
