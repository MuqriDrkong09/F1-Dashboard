import { render, screen, waitFor } from "@testing-library/react";
import CountdownTimer from "../../pages/CountdownTimer";
import { getMeetingsByYear, getSessionsByMeeting } from "../../services/openf1";

jest.mock("../../services/openf1", () => ({
  getMeetingsByYear: jest.fn(),
  getSessionsByMeeting: jest.fn(),
}));

describe("CountdownTimer page", () => {
  const anchorMs = 1_704_067_200_000;

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(anchorMs);
    jest.clearAllMocks();
  });

  afterEach(() => {
    Date.now.mockRestore();
  });

  it("renders countdown when an upcoming meeting and session exist", async () => {
    const meetingEnd = new Date(anchorMs + 5 * 86400000).toISOString();
    const sessionStart = new Date(anchorMs + 7 * 86400000).toISOString();

    getMeetingsByYear.mockResolvedValue([
      {
        meeting_key: 10,
        meeting_name: "Next Grand Prix",
        circuit_short_name: "NXT",
        country_name: "Nextland",
        date_start: new Date(anchorMs + 86400000).toISOString(),
        date_end: meetingEnd,
      },
    ]);
    getSessionsByMeeting.mockResolvedValue([
      { session_name: "Race", date_start: sessionStart },
    ]);

    render(<CountdownTimer />);

    await waitFor(() =>
      expect(screen.getByText("Next Grand Prix")).toBeInTheDocument(),
    );
    expect(screen.getByText(/Race.*NXT.*Nextland/)).toBeInTheDocument();
    await waitFor(() => {
      const el = document.querySelector("[data-urgency]");
      expect(el?.getAttribute("data-urgency")).toBe("calm");
    });
  });

  it("uses amber urgency when session is under 24 hours away", async () => {
    const meetingEnd = new Date(anchorMs + 5 * 86400000).toISOString();
    const sessionStart = new Date(anchorMs + 12 * 3600000).toISOString();

    getMeetingsByYear.mockResolvedValue([
      {
        meeting_key: 10,
        meeting_name: "Soon GP",
        circuit_short_name: "SNX",
        country_name: "Soonland",
        date_start: new Date(anchorMs + 86400000).toISOString(),
        date_end: meetingEnd,
      },
    ]);
    getSessionsByMeeting.mockResolvedValue([
      { session_name: "Qualifying", date_start: sessionStart },
    ]);

    render(<CountdownTimer />);

    await waitFor(() => expect(screen.getByText("Soon GP")).toBeInTheDocument());
    await waitFor(() => {
      expect(document.querySelector("[data-urgency]")?.getAttribute("data-urgency")).toBe(
        "soon",
      );
    });
  });

  it("uses red urgency and pulse window when under one hour", async () => {
    const meetingEnd = new Date(anchorMs + 5 * 86400000).toISOString();
    const sessionStart = new Date(anchorMs + 30 * 60 * 1000).toISOString();

    getMeetingsByYear.mockResolvedValue([
      {
        meeting_key: 11,
        meeting_name: "Urgent GP",
        circuit_short_name: "URG",
        country_name: "Rushland",
        date_start: new Date(anchorMs + 86400000).toISOString(),
        date_end: meetingEnd,
      },
    ]);
    getSessionsByMeeting.mockResolvedValue([
      { session_name: "Race", date_start: sessionStart },
    ]);

    render(<CountdownTimer />);

    await waitFor(() => expect(screen.getByText("Urgent GP")).toBeInTheDocument());
    await waitFor(() => {
      expect(document.querySelector("[data-urgency]")?.getAttribute("data-urgency")).toBe(
        "urgent",
      );
    });
  });

  it("renders error when no upcoming meeting exists", async () => {
    getMeetingsByYear.mockResolvedValue([
      {
        meeting_key: 1,
        date_start: "2020-01-01",
        date_end: "2020-01-02",
      },
    ]);

    render(<CountdownTimer />);

    await waitFor(() =>
      expect(screen.getByText("No upcoming meeting found")).toBeInTheDocument(),
    );
  });
});
