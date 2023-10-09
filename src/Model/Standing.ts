import { StandingType } from "./StandingType"

export interface Standing {
    position: number,
    team: string,
    wins: number,
    loses: number,
    ties: number,
    winsPercentage: number
    gamesBehind?: number
    type: StandingType
}
