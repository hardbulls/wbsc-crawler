import { Game } from "./Model/Game";
import { Standing } from "./Model/Standing";
import { GameCrawler } from "./GameCrawler";
import { StandingsCrawler } from "./StandingsCrawler";

export { GameCrawler } from "./GameCrawler";
export { StandingsCrawler } from "./StandingsCrawler";

export { Game } from "./Model/Game";
export { Standing } from "./Model/Standing";
export { GameStatus } from "./Model/GameStatus";

type CrawlOptions = {
  timezone: string | undefined;
  standings: string | undefined;
  games: string | undefined;
};

interface CrawlResponse {
  standings: Standing[];
  games: Game[];
}

export const crawl = async (options: CrawlOptions): Promise<CrawlResponse> => {
  let games: Game[] = [];
  let standings: Standing[] = [];

  if (options.games) {
    games = await GameCrawler.crawl(options.games, options.timezone);
  }

  if (options.standings) {
    standings = await StandingsCrawler.crawl(options.standings);
  }

  return {
    games,
    standings,
  };
};
