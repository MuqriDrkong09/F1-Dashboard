import { useEffect, useState } from "react";
import {
  getDriversBySession,
  getLatestDriverChampionship,
} from "../services/openf1";

export function useDriverStandings() {
  const [standings, setStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDriverStandings() {
      try {
        setIsLoading(true);
        setError(null);

        const rawStandings = await getLatestDriverChampionship(
          controller.signal,
        );

        if (rawStandings.length === 0) {
          throw new Error("No championship driver data available from OpenF1");
        }

        const sessionKey = rawStandings[0]?.session_key;

        if (!sessionKey) {
          throw new Error("OpenF1 response did not include a valid session key");
        }

        const driversData = await getDriversBySession(
          sessionKey,
          controller.signal,
        );

        const driversByNumber = new Map(
          (Array.isArray(driversData) ? driversData : []).map((driver) => [
            driver.driver_number,
            driver,
          ]),
        );

        const formattedStandings = rawStandings.map((entry) => {
          const driver = driversByNumber.get(entry.driver_number);
          const fullName =
            driver?.full_name
              ?.toLowerCase()
              .split(" ")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ") ?? `Driver #${entry.driver_number}`;

          return {
            position: Number(entry.position_current),
            points: Number(entry.points_current ?? 0),
            wins: 0,
            code: driver?.name_acronym ?? "",
            fullName,
            broadcastName: driver?.broadcast_name ?? "",
            driverNumber: Number(entry.driver_number),
            headshotUrl: driver?.headshot_url ?? "",
            constructor: driver?.team_name ?? "Unknown Team",
            teamColor: driver?.team_colour ? `#${driver.team_colour}` : "",
          };
        });

        formattedStandings.sort((a, b) => a.position - b.position);

        setStandings(formattedStandings);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Failed to fetch OpenF1 driver standings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDriverStandings();

    return () => controller.abort();
  }, [reloadKey]);

  const refetch = () => {
    setReloadKey((current) => current + 1);
  };

  return { standings, isLoading, error, lastUpdated, refetch };
}
