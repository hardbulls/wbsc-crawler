import { Livescore } from "./Model/Livescore";
import { GameStatus } from "./Model/GameStatus";
import { fetchUrl } from "./fetch";

const LIVESCORES_URL = "https://game.wbsc.org/gamedata/livescores.json";

interface RawLivescore {
  gameid: string;
  tournamentid: string;
  inning: string;
  homeruns: string;
  awayruns: string;
  balls: string;
  strikes: string;
  outs: string;
  runner1: string;
  runner2: string;
  runner3: string;
  pitcher: string;
  batter: string;
  status: string;
  start: string;
  start_tz: string;
}

function parseInning(raw: string): { number: number; half: "top" | "bottom" } | null {
  const match = raw.match(/^([TB])(\d+)/);

  if (!match) {
    return null;
  }

  return {
    half: match[1] === "T" ? "top" : "bottom",
    number: parseInt(match[2], 10),
  };
}

function mapStatus(raw: string): GameStatus {
  const code = parseInt(raw, 10);

  if (code === 1) return GameStatus.ONGOING;
  if (code === 2 || code === 3) return GameStatus.FINISHED;
  if (code === 4) return GameStatus.FORFEIT;
  if (code === -2) return GameStatus.SUSPENDED;
  if (code === -3) return GameStatus.CANCELED;

  return GameStatus.SCHEDULED;
}

function mapLivescore(raw: RawLivescore): Livescore {
  const inning = parseInning(raw.inning);

  return {
    gameId: raw.gameid,
    tournamentId: raw.tournamentid,
    inning: inning?.number ?? null,
    inningHalf: inning?.half ?? null,
    homeRuns: parseInt(raw.homeruns, 10) || 0,
    awayRuns: parseInt(raw.awayruns, 10) || 0,
    balls: parseInt(raw.balls, 10) || 0,
    strikes: parseInt(raw.strikes, 10) || 0,
    outs: parseInt(raw.outs, 10) || 0,
    runner1: raw.runner1 === "1",
    runner2: raw.runner2 === "1",
    runner3: raw.runner3 === "1",
    pitcher: raw.pitcher,
    batter: raw.batter,
    status: mapStatus(raw.status),
  };
}

export const LivescoreCrawler = {
  crawl: async (): Promise<Livescore[]> => {
    const response = await fetchUrl(LIVESCORES_URL, { method: "GET" });
    const data: RawLivescore[] = await response.json();

    return data.map(mapLivescore);
  },
};
