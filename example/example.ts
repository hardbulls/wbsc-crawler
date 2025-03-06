import { crawl } from "../src";

(async () => {
  const { games, standings, statistics } = await crawl({
    timezone: "Europe/Vienna",
    // standings:
    //   "https://www.baseballsoftball.at/de/events/baseball-2-bundesliga-west-2024/standings",
    games:
    "https://www.baseballsoftball.at/de/events/baseball-ponyliga-west-u14-2025/schedule-and-results",
    // "https://www.baseballsoftball.at/de/events/baseball-ponyliga-vorarlberg-u14-2024/schedule-and-results",
      // "https://www.baseballsoftball.at/de/events/baseball-bundesliga-2024/calendars?round=&team=29142&date=",
    // "https://www.baseballsoftball.at/de/events/baseball-2-bundesliga-west-2024/calendars?round=&team=29979&date=",
    statistics: {
      // batting:
        // "https://www.baseballsoftball.at/de/events/baseball-2-bundesliga-west-2024/stats/general/team/29979/all/batting",
      // pitching:
        // "https://www.baseballsoftball.at/de/events/baseball-2-bundesliga-west-2024/stats/general/team/29979/all/pitching",
      // fielding:
        // "https://www.baseballsoftball.at/de/events/baseball-2-bundesliga-west-2024/stats/general/team/29979/all/fielding",
    },
  });

  console.log(games);
})();
