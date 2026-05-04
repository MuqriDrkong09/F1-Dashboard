import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SessionLaps from "../../pages/SessionLaps";
import {
  getDriversBySession,
  getLapsBySession,
  getSessionsByMeeting,
  resolveMeetingForDetail,
} from "../../services/openf1";

jest.mock("../../services/openf1", () => ({
  resolveMeetingForDetail: jest.fn(),
  getSessionsByMeeting: jest.fn(),
  getLapsBySession: jest.fn(),
  getDriversBySession: jest.fn(),
}));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/races/:meetingKey/session/:sessionKey/laps" element={<SessionLaps />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SessionLaps page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows lap table for selected driver", async () => {
    resolveMeetingForDetail.mockResolvedValue({
      meeting_name: "Test GP",
      circuit_short_name: "TST",
      country_name: "Testland",
    });
    getSessionsByMeeting.mockResolvedValue([
      {
        session_key: 9001,
        session_name: "Race",
        session_type: "Race",
      },
    ]);
    getDriversBySession.mockResolvedValue([
      { driver_number: 11, full_name: "Test Driver", broadcast_name: "TD" },
    ]);
    getLapsBySession.mockResolvedValue([
      {
        driver_number: 11,
        lap_number: 1,
        duration_sector_1: 30,
        duration_sector_2: 40,
        duration_sector_3: 25,
        lap_duration: 95,
        i1_speed: 280,
        i2_speed: 260,
        st_speed: 300,
        is_pit_out_lap: false,
      },
    ]);

    renderAt("/races/42/session/9001/laps");

    await waitFor(() => expect(screen.getByText("Test GP")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("95.000")).toBeInTheDocument());
    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toHaveTextContent(
      "Lap times",
    );
  });

  it("shows error for invalid URL params", async () => {
    renderAt("/races/foo/session/bar/laps");

    await waitFor(() =>
      expect(screen.getByText("Invalid meeting or session in URL")).toBeInTheDocument(),
    );
  });
});
