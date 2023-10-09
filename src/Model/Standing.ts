import { StandingType } from "./StandingType";

export interface Standing {
  results: Array<{
    position: number;
    team: string;
    wins: number;
    loses: number;
    ties: number;
    winsPercentage: number;
    gamesBehind?: number;
  }>;
  type: StandingType;
}
