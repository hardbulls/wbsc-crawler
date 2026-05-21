export interface LivePlayPlayer {
  name: string;
  playerId: string;
}

export interface LivePlayBatterRecord {
  hits: number;
  atBats: number;
}

export type LivePlayPitchType = "ball" | "strike" | "inPlay" | "event";

export interface LivePlayPitch {
  type: LivePlayPitchType;
  description: string;
}

export interface LivePlaySituation {
  currentInning: string;
  inning: number;
  inningHalf: "top" | "bottom" | null;
  batter: LivePlayPlayer;
  batterRecord: LivePlayBatterRecord;
  batterAverage: string;
  pitcher: LivePlayPlayer;
  earnedRunAverage: string;
  inningsPitched: string;
  pitchSequence: LivePlayPitch[];
  runner1: string | null;
  runner2: string | null;
  runner3: string | null;
  outs: number;
  balls: number;
  strikes: number;
}

export interface LivePlayBatter {
  name: string;
  playerId: string;
  image: string;
  position: string;
  plateAppearances: number;
  atBats: number;
  runs: number;
  hits: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  average: string;
}

export interface LivePlayPitcher {
  name: string;
  playerId: string;
  image: string;
  inningsPitched: string;
  earnedRuns: number;
  hitsAllowed: number;
  walksAllowed: number;
  strikeouts: number;
  earnedRunAverage: string;
}

export interface LivePlayLineup {
  batters: LivePlayBatter[];
  pitchers: LivePlayPitcher[];
}

export type LivePlayPitchOutcome =
  | "ball"
  | "calledStrike"
  | "swingingStrike"
  | "foul"
  | "inPlay"
  | "unknown";

export interface LivePlayEvent {
  description: string;
  inning: number;
  inningHalf: "top" | "bottom" | null;
  pitchOutcome: LivePlayPitchOutcome;
}

export interface LivePlayLinescoreTotals {
  runs: number;
  hits: number;
  errors: number;
}

export interface LivePlayLinescore {
  awayRunsByInning: (number | null)[];
  homeRunsByInning: (number | null)[];
  awayTotals: LivePlayLinescoreTotals;
  homeTotals: LivePlayLinescoreTotals;
}

export interface LivePlay {
  lastPlay: number;
  gameId: string;
  gameOver: boolean;
  eventLocation: string;
  eventHome: string;
  eventAway: string;
  eventHomeId: string;
  eventAwayId: string;
  regulationInnings: number;
  situation: LivePlaySituation;
  homeLineup: LivePlayLineup;
  awayLineup: LivePlayLineup;
  linescore: LivePlayLinescore;
  plays: LivePlayEvent[];
  lastPlayDescription: string;
}
