import { JSDOM } from "jsdom";
import { querySelectorOrThrow } from "./Parser/Selector";
import { PlayerStatistics } from "./Model/PlayerStatistics";

type HeaderMapping = {
  [key: string]: string;
};

type StatisticsResult = {
  name: string;
  statistics: {
    [key: string]: number;
  };
};

export type StatisticsCrawlerOptions = {
  batting?: string;
  pitching?: string;
  fielding?: string;
};

export const StatisticsCrawler = {
  crawl: async (
    options: StatisticsCrawlerOptions,
  ): Promise<PlayerStatistics[]> => {
    let battingStatistics: { [key: string]: StatisticsResult } = {};
    let pitchingStatistics: { [key: string]: StatisticsResult } = {};
    let fieldingStatistics: { [key: string]: StatisticsResult } = {};

    if (options.batting) {
      battingStatistics = await crawlUrl(options.batting);
    }

    if (options.pitching) {
      pitchingStatistics = await crawlUrl(options.pitching);
    }

    if (options.fielding) {
      fieldingStatistics = await crawlUrl(options.fielding);
    }

    const names = [
      ...Object.keys(battingStatistics),
      ...Object.keys(pitchingStatistics),
      ...Object.keys(fieldingStatistics),
    ];

    const result: PlayerStatistics[] = [];

    for (const name of names) {
      const playerStatistics = {
        name,
        statistics: {
          batting:
            (battingStatistics[name] && battingStatistics[name].statistics) ||
            {},
          pitching:
            (pitchingStatistics[name] && pitchingStatistics[name].statistics) ||
            {},
          fielding:
            (fieldingStatistics[name] && fieldingStatistics[name].statistics) ||
            {},
        },
      };

      result.push(playerStatistics);
    }

    return result;
  },
};

const crawlUrl = async (url: string) => {
  const html = await (await fetch(url, { method: "GET" })).text();
  const dom = new JSDOM(html);

  const table = querySelectorOrThrow(dom.window.document, "table");
  const headers = table.querySelectorAll("thead > tr > th");
  const rows = table.querySelectorAll("tbody > tr");

  const headerMapping: HeaderMapping = Array.from(headers).reduce(
    (result: HeaderMapping, header, index) => {
      const text = header.textContent;

      if (text) {
        result[index] = text.toLowerCase();
      }

      return result;
    },
    {},
  );

  const NAME_CLASS = "player";
  const TEAM_CLASS = "team";
  const results: { [key: string]: StatisticsResult } = {};

  for (const row of rows.values()) {
    const rowResult: StatisticsResult = {
      name: "",
      statistics: {},
    };

    for (const [index, column] of row.querySelectorAll("td").entries()) {
      if (headerMapping[index]) {
        if (column.classList.contains(NAME_CLASS)) {
          rowResult.name = parseNameColumn(column);
        } else if (!column.classList.contains(TEAM_CLASS)) {
          const value = column.textContent;

          if (value) {
            let parsedValue = 0;
            if (value.startsWith(".")) {
              parsedValue = Number.parseFloat(`0${value}`);
            } else {
              parsedValue = Number.parseFloat(value);
            }

            rowResult.statistics[headerMapping[index]] = parsedValue;
          }
        }
      }
    }

    results[rowResult.name] = rowResult;
  }

  return results;
};

const parseNameColumn = (column: HTMLElement): string => {
  let lastName = column.querySelector("strong")?.textContent;
  let firstName = column.textContent || undefined;

  if (lastName) {
    firstName = firstName?.substring(lastName.length).trim();

    lastName = `${lastName.charAt(0)}${lastName.slice(1).toLowerCase()}`;
  }

  return [firstName, lastName].filter(Boolean).join(" ");
};
