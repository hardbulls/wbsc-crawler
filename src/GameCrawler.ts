import { JSDOM } from "jsdom";
import { isValid as isValidDate, parse as parseDate } from "date-fns";
import { Game } from "./Model/Game";
import { GameStatus } from "./Model/GameStatus";
import { querySelectorOrThrow } from "./Parser/Selector";
import { NodeNotFoundError } from "./Parser/NodeNotFoundError";
import { fromZonedTime } from "date-fns-tz";

export const GameCrawler = {
  crawl: async (url: string, timezone?: string): Promise<Array<Game>> => {
    const html = await (await fetch(url, { method: "GET" })).text();
    const dom = new JSDOM(html);

    const rows = dom.window.document.querySelectorAll(".schedule-item");
    const games: Game[] = [];

    for (const row of rows) {
      const gameInfo = querySelectorOrThrow(
        row,
        "a.box-score-link:nth-child(1)",
      );

      const note = querySelectorOrThrow(
        row,
        "p:nth-child(4)",
      )?.textContent?.trim();

      const venue = querySelectorOrThrow(
        gameInfo,
        "div:nth-child(1) > p:nth-child(2)",
      ).textContent?.trim();

      const date = querySelectorOrThrow(
        gameInfo,
        "div:nth-child(2) > p:nth-child(2)",
      );

      if (!date || !date.textContent) {
        throw new NodeNotFoundError(2);
      }

      let parsedDate = parseDate(
        date.textContent,
        "dd/MM/yyyy, HH:mm",
        new Date(),
      );

      if (!isValidDate(parsedDate)) {
        parsedDate = parseDate(
          date.textContent,
          "dd/MM/yyyy --:--",
          new Date(),
        );

        if (isValidDate(parsedDate)) {
          parsedDate.setHours(14, 0);
        }
      }

      if (timezone) {
        parsedDate = fromZonedTime(parsedDate, timezone);
      }

      const teamInfo = querySelectorOrThrow(row, ".score");
      const awayTeamInfo = querySelectorOrThrow(
        teamInfo,
        "div.team-info:nth-child(1)",
      );

      const awayTeamName = querySelectorOrThrow(
        awayTeamInfo,
        "p:nth-child(4)p:nth-child(4)",
      ).textContent?.trim();

      const homeTeamInfo = querySelectorOrThrow(
        teamInfo,
        "div.team-info:nth-child(3)",
      );
      const homeTeamName = querySelectorOrThrow(
        homeTeamInfo,
        "p:nth-child(4)p:nth-child(4)",
      ).textContent?.trim();

      const scoreInfo = querySelectorOrThrow(
        row,
        "div.score > div:nth-child(2) > p",
      ).textContent?.trim();
      let awayScore = 0;
      let homeScore = 0;

      if (scoreInfo) {
        const parsedScore = scoreInfo
          .split(":")
          .map((v) => Number.parseInt(v.trim()));

        awayScore = parsedScore[0] || 0;
        homeScore = parsedScore[1] || 0;
      }

      const gameStatusInfo = querySelectorOrThrow(
        row,
        "div:nth-child(3) > div > a > div > p",
      );

      let gameStatus = GameStatus.SCHEDULED;
      const statusText = gameStatusInfo.textContent?.trim().toLowerCase();

      if (statusText && ["w.o.", "forfeit"].includes(statusText)) {
        gameStatus = GameStatus.FORFEIT;
      } else if (
        statusText &&
        ["fortsetzung", "suspended"].includes(statusText)
      ) {
        gameStatus = GameStatus.SUSPENDED;
      } else if (
        statusText &&
        ("final" === statusText || statusText.match(/^f\/\d+$/))
      ) {
        gameStatus = GameStatus.FINISHED;
      } else if (statusText === "canceled") {
        gameStatus = GameStatus.CANCELED;
      }

      games.push({
        venue: venue || "Unknown",
        home: homeTeamName || "Unknown",
        away: awayTeamName || "Unknown",
        awayScore: awayScore,
        homeScore: homeScore,
        status: gameStatus,
        date: parsedDate,
        note: note || null,
      });
    }

    return games;
  },
};
