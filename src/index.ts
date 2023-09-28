import {Game} from "./Model/Game";
import {Standing} from "./Model/Standing";
import {GameCrawler} from "./GameCrawler";
import {StandingsCrawler} from "./StandingsCrawler";
import {IcalGenerator} from "./Calendar/IcalGenerator";

export {GameCrawler} from "./GameCrawler";
export {StandingsCrawler} from './StandingsCrawler'

type CrawlOptions = {
    standings: string | undefined
    games: string | undefined
}

interface CrawlResponse {
    standings: Standing[]
    games: Game[]
}

export const crawl = async (options: CrawlOptions): Promise<CrawlResponse> => {
    let games: Game[] = [];
    let standings: Standing[] = [];

    if (options.games) {
        games = await GameCrawler.crawl(options.games)
    }

    if (options.standings) {
        standings = await StandingsCrawler.crawl(options.standings)
    }

    return {
        games,
        standings
    }
}

export const gamesCalendar = async (name: string, gamesUrl: string, gameDurationInMinutes: number, timezone?: string) => {
    const games = await GameCrawler.crawl(gamesUrl)

    if (!timezone) {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    return IcalGenerator.games(name, games, timezone, gameDurationInMinutes)

}
