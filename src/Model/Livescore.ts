import { GameStatus } from "./GameStatus";

export interface Livescore {
  gameId: string;
  tournamentId: string;
  inning: number | null;
  inningHalf: "top" | "bottom" | null;
  homeRuns: number;
  awayRuns: number;
  balls: number;
  strikes: number;
  outs: number;
  runner1: boolean;
  runner2: boolean;
  runner3: boolean;
  pitcher: string;
  batter: string;
  status: GameStatus;
}
