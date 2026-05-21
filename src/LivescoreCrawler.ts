import { fromZonedTime } from "date-fns-tz";
import { Livescore } from "./Model/Livescore";
import {
  LivePlay,
  LivePlayBatter,
  LivePlayBatterRecord,
  LivePlayLineup,
  LivePlayPitch,
  LivePlayPitchOutcome,
  LivePlayPitchType,
  LivePlayPitcher,
  LivePlaySituation,
} from "./Model/LivePlay";
import { GameStatus } from "./Model/GameStatus";
import { fetchUrl } from "./fetch";

const LIVESCORES_URL = "https://game.wbsc.org/gamedata/livescores.json";
const GAMEDATA_BASE_URL = "https://game.wbsc.org/gamedata";

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

function parseInning(
  raw: string,
): { number: number; half: "top" | "bottom" } | null {
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
    start: fromZonedTime(raw.start, raw.start_tz),
  };
}

interface RawBoxscoreEntry {
  name: string;
  playerid: string;
  teamcode: string;
  image: string;
  // batter fields
  POS?: string;
  PA?: number;
  AB?: number;
  R?: number;
  H?: number;
  RBI?: number;
  BB?: number;
  SO?: number;
  AVG?: string;
  // pitcher fields
  PITCHIP?: string;
  PITCHER?: number;
  PITCHH?: number;
  PITCHBB?: number;
  PITCHSO?: number;
  ERA?: string;
}

interface RawPlateCountEntry {
  type: number;
  label: string;
}

interface RawSituation {
  inning: string;
  currentinning: string;
  batter: string;
  batterid: string;
  batting: string;
  avg: string;
  pitcher: string;
  pitcherid: string;
  pitcherera: string;
  pitcherip: string;
  runner1: number | string;
  runner2: number | string;
  runner3: number | string;
  outs: number;
  balls: number;
  strikes: number;
}

interface RawLinescoreTotals {
  R: number;
  H: number;
  E: number;
}

interface RawLinescore {
  awayruns: (number | null)[];
  homeruns: (number | null)[];
  awaytotals: RawLinescoreTotals;
  hometotals: RawLinescoreTotals;
}

interface RawPlayDataEntry {
  p: number | string;
  n: string;
  i: string;
  r1: string;
}

interface RawLivePlay {
  lastplayloaded: number;
  gameid: string;
  gameover: number;
  eventlocation: string;
  eventhome: string;
  eventaway: string;
  eventhomeid: string;
  eventawayid: string;
  innings: string;
  situation: RawSituation;
  boxscore: Record<string, RawBoxscoreEntry>;
  linescore: RawLinescore;
  platecount: RawPlateCountEntry[];
  playdata: RawPlayDataEntry[];
}

function resolveRunner(
  raw: number | string,
  boxscore: Record<string, RawBoxscoreEntry>,
): string | null {
  if (!raw || raw === 0 || raw === "0") return null;
  return boxscore[String(raw)]?.name ?? null;
}

function mapInningHalf(currentInning: string): "top" | "bottom" | null {
  const upper = currentInning.toUpperCase();
  if (upper.startsWith("TOP")) return "top";
  if (upper.startsWith("BOT")) return "bottom";
  return null;
}

function parseBatterRecord(raw: string): LivePlayBatterRecord {
  const match = raw.match(/^(\d+) for (\d+)/);
  return match
    ? { hits: parseInt(match[1], 10), atBats: parseInt(match[2], 10) }
    : { hits: 0, atBats: 0 };
}

function mapPitchOutcome(r1: string): LivePlayPitchOutcome {
  switch (r1) {
    case "2":
      return "ball";
    case "4":
      return "calledStrike";
    case "5":
      return "swingingStrike";
    case "6":
      return "foul";
    case "9":
      return "inPlay";
    default:
      return "unknown";
  }
}

function mapPitchType(type: number): LivePlayPitchType {
  if (type === 1) return "ball";
  if (type === 2) return "strike";
  if (type === 3) return "inPlay";
  return "event";
}

function mapLineup(
  boxscore: Record<string, RawBoxscoreEntry>,
  teamCode: string,
): LivePlayLineup {
  const entries = Object.entries(boxscore)
    .filter(([, e]) => e.teamcode === teamCode)
    .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
    .map(([, e]) => e);

  const batters: LivePlayBatter[] = entries
    .filter((e) => e.POS !== undefined)
    .map((e) => ({
      name: e.name,
      playerId: e.playerid,
      image: e.image,
      position: e.POS!,
      plateAppearances: e.PA ?? 0,
      atBats: e.AB ?? 0,
      runs: e.R ?? 0,
      hits: e.H ?? 0,
      rbi: e.RBI ?? 0,
      walks: e.BB ?? 0,
      strikeouts: e.SO ?? 0,
      average: e.AVG ?? ".000",
    }));

  const pitchers: LivePlayPitcher[] = entries
    .filter((e) => e.PITCHIP !== undefined)
    .map((e) => ({
      name: e.name,
      playerId: e.playerid,
      image: e.image,
      inningsPitched: e.PITCHIP!,
      earnedRuns: e.PITCHER ?? 0,
      hitsAllowed: e.PITCHH ?? 0,
      walksAllowed: e.PITCHBB ?? 0,
      strikeouts: e.PITCHSO ?? 0,
      earnedRunAverage: e.ERA ?? "0.00",
    }));

  return { batters, pitchers };
}

function mapLivePlay(raw: RawLivePlay): LivePlay {
  const pitchSequence: LivePlayPitch[] = [...raw.platecount]
    .reverse()
    .map((entry) => ({
      type: mapPitchType(entry.type),
      description: entry.label,
    }));

  const situation: LivePlaySituation = {
    currentInning: raw.situation.currentinning,
    inning: parseInt(raw.situation.inning, 10) || 0,
    inningHalf: mapInningHalf(raw.situation.currentinning),
    batter: { name: raw.situation.batter, playerId: raw.situation.batterid },
    batterRecord: parseBatterRecord(raw.situation.batting),
    batterAverage: raw.situation.avg,
    pitcher: { name: raw.situation.pitcher, playerId: raw.situation.pitcherid },
    earnedRunAverage: raw.situation.pitcherera,
    inningsPitched: raw.situation.pitcherip,
    pitchSequence,
    runner1: resolveRunner(raw.situation.runner1, raw.boxscore),
    runner2: resolveRunner(raw.situation.runner2, raw.boxscore),
    runner3: resolveRunner(raw.situation.runner3, raw.boxscore),
    outs: raw.situation.outs,
    balls: raw.situation.balls,
    strikes: raw.situation.strikes,
  };

  type PlayEvent = {
    description: string;
    inning: number;
    inningHalf: "top" | "bottom" | null;
    pitchOutcome: LivePlayPitchOutcome;
  };
  let currentHalf: "top" | "bottom" | null = null;
  const plays = [...raw.playdata]
    .reverse()
    .reduce<PlayEvent[]>((acc, entry) => {
      if (entry.p === 0 || entry.p === "0") {
        if (entry.n.includes("***TOP")) currentHalf = "top";
        else if (entry.n.includes("***BOT")) currentHalf = "bottom";
        return acc;
      }
      acc.push({
        description: entry.n,
        inning: parseInt(entry.i, 10) || 0,
        inningHalf: currentHalf,
        pitchOutcome: mapPitchOutcome(entry.r1),
      });
      return acc;
    }, []);

  return {
    lastPlay: raw.lastplayloaded,
    gameId: raw.gameid,
    gameOver: raw.gameover !== 0,
    eventLocation: raw.eventlocation,
    eventHome: raw.eventhome,
    eventAway: raw.eventaway,
    eventHomeId: raw.eventhomeid,
    eventAwayId: raw.eventawayid,
    regulationInnings: parseInt(raw.innings, 10),
    situation,
    homeLineup: mapLineup(raw.boxscore, raw.eventhome),
    awayLineup: mapLineup(raw.boxscore, raw.eventaway),
    linescore: {
      awayRunsByInning: raw.linescore.awayruns,
      homeRunsByInning: raw.linescore.homeruns,
      awayTotals: {
        runs: raw.linescore.awaytotals.R,
        hits: raw.linescore.awaytotals.H,
        errors: raw.linescore.awaytotals.E,
      },
      homeTotals: {
        runs: raw.linescore.hometotals.R,
        hits: raw.linescore.hometotals.H,
        errors: raw.linescore.hometotals.E,
      },
    },
    plays,
    lastPlayDescription: raw.playdata[0]?.n ?? "",
  };
}

async function fetchLivePlay(gameId: string): Promise<LivePlay> {
  const latestRes = await fetchUrl(
    `${GAMEDATA_BASE_URL}/${gameId}/latest.json`,
    { method: "GET" },
  );
  const latestPlay: number = await latestRes.json();

  const playRes = await fetchUrl(
    `${GAMEDATA_BASE_URL}/${gameId}/play${latestPlay}.json`,
    { method: "GET" },
  );
  const raw: RawLivePlay = await playRes.json();

  return mapLivePlay(raw);
}

export const LivescoreCrawler = {
  crawl: async (): Promise<Livescore[]> => {
    const response = await fetchUrl(LIVESCORES_URL, { method: "GET" });
    const data: RawLivescore[] = await response.json();

    return data.map(mapLivescore);
  },

  crawlPlay: async (gameId: string): Promise<LivePlay> => {
    return fetchLivePlay(gameId);
  },

  crawlByGameId: async (gameId: string): Promise<Livescore | null> => {
    const response = await fetchUrl(LIVESCORES_URL, { method: "GET" });
    const data: RawLivescore[] = await response.json();
    const raw = data.find((entry) => entry.gameid === gameId);

    if (!raw) return null;

    const livescore = mapLivescore(raw);
    livescore.play = await fetchLivePlay(gameId);

    return livescore;
  },
};
