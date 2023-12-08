import { crawl } from "../src";

(async () => {
  const { games, standings, statistics } = await crawl({
    timezone: "Europe/Vienna",
    standings:
      "https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/standings",
    games:
      "https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/calendars?round=&team=24492&date=",
    statistics: {
      batting:
        "https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/stats/general/team/24492/all/batting",
      pitching:
        "https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/stats/general/team/24492/all/pitching",
      fielding:
        "https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/stats/general/team/24492/2067/fielding",
    },
  });

  console.log(statistics);
})();
