import { Game } from "./Model/Game";
import { Standing } from "./Model/Standing";
import { GameCrawler, GameCrawlerOptions } from "./GameCrawler";
import { StandingsCrawler } from "./StandingsCrawler";
import {
  StatisticsCrawler,
  StatisticsCrawlerOptions,
} from "./StatisticsCrawler";
import { PlayerStatistics } from "./Model/PlayerStatistics";
import { JsonStatisticsCrawler } from "./JsonStatisticsCrawler";

export { GameCrawler, GameCrawlerOptions } from "./GameCrawler";
export { StandingsCrawler } from "./StandingsCrawler";
export { StatisticsCrawler } from "./StatisticsCrawler";
export { JsonStatisticsCrawler } from "./JsonStatisticsCrawler";

export { Game } from "./Model/Game";
export { Standing } from "./Model/Standing";
export { GameStatus } from "./Model/GameStatus";

type CrawlOptions = {
  timezone?: string;
  tickerUrlPattern?: string;
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
    const gameCrawlerOptions: GameCrawlerOptions = {
      timezone: options.timezone,
      tickerUrlPattern: options.tickerUrlPattern,
    };
    games = await GameCrawler.crawl(options.games, gameCrawlerOptions);
  }

  if (options.standings) {
    standings = await StandingsCrawler.crawl(options.standings);
  }

  if (options.statistics) {
    statistics = await JsonStatisticsCrawler.crawl(options.statistics);
  }

  return {
    games,
    standings,
    statistics,
  };
};
