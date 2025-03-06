import { JSDOM } from "jsdom";
import { isValid as isValidDate, parse as parseDate } from "date-fns";
import { Game } from "./Model/Game";
import { GameStatus } from "./Model/GameStatus";
import { querySelectorOrThrow } from "./Parser/Selector";
import { NodeNotFoundError } from "./Parser/NodeNotFoundError";
import { fromZonedTime } from "date-fns-tz";
import { fetchUrl } from "./fetch";

export const GameCrawler = {
  crawl: async (url: string, timezone?: string): Promise<Array<Game>> => {
    const html = await (await fetchUrl(url, { method: "GET" })).text();
    const dom = new JSDOM(html);

    const appElement = dom.window.document.querySelector(
      "#app",
    ) as HTMLDivElement | null;

    if (appElement && appElement.hasAttribute("data-page")) {
      return crawlAppJson(dom, timezone);
    }

    return crawlHtml(dom, timezone);
  },
};

function crawlHtml(dom: JSDOM, timezone?: string): Game[] {
  const rows = dom.window.document.querySelectorAll(".schedule-item");
  const games: Game[] = [];

  for (const row of rows) {
    const gameInfo = querySelectorOrThrow(row, "a.box-score-link:nth-child(1)");

    // TODO find a game where is set...
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const note = null;

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
      parsedDate = parseDate(date.textContent, "dd/MM/yyyy --:--", new Date());

      if (isValidDate(parsedDate)) {
        parsedDate.setHours(14, 0);
      }
    }

    if (timezone) {
      parsedDate = fromZonedTime(parsedDate, timezone);
    }

    const teamInfo =
      row.querySelector(".score") ||
      row.querySelector(".regular-score") ||
      querySelectorOrThrow(row, ".baseball-score-bug");
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

    const scoreInfo =
      row.querySelector("div.score > div:nth-child(2) > p") ||
      row.querySelector("div.regular-score > div:nth-child(2) > p") ||
      querySelectorOrThrow(
        row,
        "div.baseball-score-bug > div:nth-child(2) > p",
      );
    const scoreInfoText = scoreInfo.textContent?.trim();

    let awayScore = 0;
    let homeScore = 0;

    if (scoreInfoText) {
      const parsedScore = scoreInfoText
        .split(":")
        .map((v) => Number.parseInt(v.trim()));

      awayScore = parsedScore[0] || 0;
      homeScore = parsedScore[1] || 0;
    }

    const gameStatusInfo = querySelectorOrThrow(
      row,
      "div.calendar-buttons a > div > p",
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
      note: null,
    });
  }

  return games;
}

function crawlAppJson(dom: JSDOM, timezone?: string): Game[] {
  const appElement = dom.window.document.querySelector(
    "#app",
  ) as HTMLDivElement;
  const dataPage = appElement.getAttribute("data-page") as string;
  const data = JSON.parse(dataPage);
  const games: Game[] = [];

  for (const gameData of data.props.games) {
    let gameStatus = GameStatus.SCHEDULED;

    if (gameData.gamestatus === 3) {
      gameStatus = GameStatus.FINISHED;
    } else if (gameData.gamestatus === 4) {
      gameStatus = GameStatus.FORFEIT;
    } else if (gameData.gamestatus === 0) {
      gameStatus = GameStatus.SCHEDULED;
    } else if (gameData.gamestatus === -3) {
      gameStatus = GameStatus.CANCELED;
    } else if (gameData.gamestatus === -2) {
      gameStatus = GameStatus.SUSPENDED;
    }

    let parsedDate = gameData.start;

    if (timezone) {
      parsedDate = fromZonedTime(parsedDate, timezone);
    }

    games.push({
      venue: [gameData.stadium, gameData.location].join(", ") || "Unknown",
      home: gameData.homelabel || "Unknown",
      away: gameData.awaylabel || "Unknown",
      awayScore: gameData.awayruns,
      homeScore: gameData.homeruns,
      status: gameStatus,
      date: parsedDate,
      note: gameData.note || null,
    });
  }

  return games;
}
