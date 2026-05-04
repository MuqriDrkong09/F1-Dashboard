import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RaceMeetingSessions from "../../pages/RaceMeetingSessions";
import { getSessionsByMeeting, resolveMeetingForDetail } from "../../services/openf1";

jest.mock("../../services/openf1", () => ({
  resolveMeetingForDetail: jest.fn(),
  getSessionsByMeeting: jest.fn(),
}));

function renderAtMeeting(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/races/:meetingKey" element={<RaceMeetingSessions />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RaceMeetingSessions page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists sessions for a meeting", async () => {
    resolveMeetingForDetail.mockResolvedValue({
      meeting_name: "Test GP",
      circuit_short_name: "TST",
      country_name: "Testland",
    });
    getSessionsByMeeting.mockResolvedValue([
      {
        session_key: 101,
        session_name: "Practice 1",
        session_type: "Practice",
        date_start: "2026-03-01T10:00:00Z",
      },
    ]);

    renderAtMeeting("/races/42");

    await waitFor(() => expect(screen.getByText("Practice 1")).toBeInTheDocument());
    expect(screen.getByText("Test GP")).toBeInTheDocument();
    expect(screen.getByText("Practice")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view laps/i })).toHaveAttribute(
      "href",
      "/races/42/session/101/laps",
    );
  });

  it("shows error for invalid meeting key", async () => {
    renderAtMeeting("/races/not-a-number");

    await waitFor(() =>
      expect(screen.getByText("Invalid meeting in URL")).toBeInTheDocument(),
    );
  });
});
