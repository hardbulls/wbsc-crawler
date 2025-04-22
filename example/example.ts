import { crawl } from "../src";
import { inspect } from "util";

(async () => {
  const { games, standings, statistics } = await crawl({
    timezone: "Europe/Vienna",
    // standings:
    //   "https://www.baseballsoftball.at/de/events/baseball-2-bundesliga-west-2024/standings",
    // games: [],
    // "https://www.baseballsoftball.at/de/events/baseball-ponyliga-west-u14-2025/schedule-and-results",
    // "https://www.baseballsoftball.at/de/events/baseball-ponyliga-vorarlberg-u14-2024/schedule-and-results",
    // "https://www.baseballsoftball.at/de/events/baseball-bundesliga-2024/calendars?round=&team=29142&date=",
    // "https://www.baseballsoftball.at/de/events/baseball-2-bundesliga-west-2024/calendars?round=&team=29979&date=",
    statistics: {
      batting:
        "https://www.baseballsoftball.at/api/v1/stats/events/baseball-bundesliga-2024/index?section=players&stats-section=batting&team=29142&round=&split=&split=&language=de",
      pitching:
        "https://www.baseballsoftball.at/api/v1/stats/events/baseball-bundesliga-2024/index?section=players&stats-section=pitching&team=29142&round=&split=&split=&language=de",
      fielding:
          "https://www.baseballsoftball.at/api/v1/stats/events/baseball-bundesliga-2024/index?section=players&stats-section=fielding&team=29142&round=&split=&split=&language=de",
    },
  });

  console.log(
    inspect(statistics, { showHidden: false, depth: null, colors: true }),
  );
})();
