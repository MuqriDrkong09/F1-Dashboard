import { mergeConstructorStandings } from "../../utils/mergeConstructorStandings";

describe("mergeConstructorStandings", () => {
  it("returns original rows when every team has a name", () => {
    const teams = [
      { team_name: "McLaren", points_current: 10, position_current: 1 },
    ];
    const out = mergeConstructorStandings(teams, [], []);
    expect(out).toBe(teams);
  });

  it("rebuilds names and points from drivers and championship_drivers when team_name is null", () => {
    const teams = [
      {
        meeting_key: 1,
        session_key: 2,
        team_name: null,
        position_current: null,
        points_current: 99,
      },
    ];
    const drivers = [
      {
        driver_number: 4,
        team_name: "McLaren",
        full_name: "Lando",
        meeting_key: 1,
        session_key: 2,
      },
      {
        driver_number: 81,
        team_name: "McLaren",
        full_name: "Oscar",
        meeting_key: 1,
        session_key: 2,
      },
    ];
    const ch = [
      { driver_number: 4, points_current: 30 },
      { driver_number: 81, points_current: 20 },
    ];
    const out = mergeConstructorStandings(teams, drivers, ch);
    expect(out).toEqual([
      {
        meeting_key: 1,
        session_key: 2,
        team_name: "McLaren",
        position_start: null,
        position_current: 1,
        points_start: null,
        points_current: 50,
      },
    ]);
  });

  it("includes zero-point teams from the roster when championship rows are empty", () => {
    const teams = [{ team_name: null, points_current: 0, meeting_key: 1, session_key: 2 }];
    const drivers = [
      { driver_number: 1, team_name: "Solo F1" },
    ];
    const out = mergeConstructorStandings(teams, drivers, []);
    expect(out[0].team_name).toBe("Solo F1");
    expect(out[0].points_current).toBe(0);
  });
});
