import { GameStatus } from "./GameStatus";

export interface Game {
  status: GameStatus;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  date: Date;
  note?: string | null;
}
