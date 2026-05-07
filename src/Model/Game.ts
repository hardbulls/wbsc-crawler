import { GameStatus } from "./GameStatus";
import { Livescore } from "./Livescore";

export interface Game {
  status: GameStatus;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  date: Date;
  note?: string | null;
  tickerUrl?: string | null;
  externalGameId?: string | null;
  externalTournamentId?: string | null;
  externalTournamentKey?: string | null;
  livescore?: Livescore | null;
}
