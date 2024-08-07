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

    const rows = dom.window.document.querySelectorAll(".game-row");
    const games: Game[] = [];

    for (const row of rows) {
      const gameInfo = querySelectorOrThrow(row, ".game-info");

      const note = querySelectorOrThrow(
        row,
        "p:nth-child(1)",
      )?.textContent?.trim();

      const venue = querySelectorOrThrow(
        gameInfo,
        "p:nth-last-child(3)",
      ).textContent?.trim();
      const date = querySelectorOrThrow(gameInfo, "p:nth-last-child(1)")
        .childNodes?.[4];

      if (!date || !date.textContent) {
        throw new NodeNotFoundError(4);
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

      const teamInfo = querySelectorOrThrow(row, ".opponents");
      const awayTeamInfo = querySelectorOrThrow(
        teamInfo,
        ".text-center:nth-child(1)",
      );
      const awayTeamName = querySelectorOrThrow(
        awayTeamInfo,
        ".team-name",
      ).textContent?.trim();

      const homeTeamInfo = querySelectorOrThrow(
        teamInfo,
        ".text-center:nth-child(3)",
      );
      const homeTeamName = querySelectorOrThrow(
        homeTeamInfo,
        ".team-name",
      ).textContent?.trim();

      const scoreInfo = querySelectorOrThrow(
        teamInfo,
        ".text-center:nth-child(2) > .score",
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

      const gameStatusInfo = querySelectorOrThrow(row, ".game-status-label");

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
        Array.from(gameStatusInfo.classList.values()).includes("final-green")
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
