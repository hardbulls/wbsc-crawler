import { Game } from "./Model/Game";
import { Standing } from "./Model/Standing";
import { GameCrawler } from "./GameCrawler";
import { StandingsCrawler } from "./StandingsCrawler";
import {
  StatisticsCrawler,
  StatisticsCrawlerOptions,
} from "./StatisticsCrawler";
import { PlayerStatistics } from "./Model/PlayerStatistics";

export { GameCrawler } from "./GameCrawler";
export { StandingsCrawler } from "./StandingsCrawler";

export { Game } from "./Model/Game";
export { Standing } from "./Model/Standing";
export { GameStatus } from "./Model/GameStatus";

type CrawlOptions = {
  timezone?: string;
  standings?: string;
  games?: string;
  statistics?: StatisticsCrawlerOptions;
};

interface CrawlResponse {
  standings: Standing[];
  games: Game[];
  statistics: PlayerStatistics[];
}

export const crawl = async (options: CrawlOptions): Promise<CrawlResponse> => {
  let games: Game[] = [];
  let standings: Standing[] = [];
  let statistics: PlayerStatistics[] = [];

  if (options.games) {
    games = await GameCrawler.crawl(options.games, options.timezone);
  }

  if (options.standings) {
    standings = await StandingsCrawler.crawl(options.standings);
  }

  if (options.statistics) {
    statistics = await StatisticsCrawler.crawl(options.statistics);
  }

  return {
    games,
    standings,
    statistics,
  };
};
