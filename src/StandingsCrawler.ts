import { JSDOM } from "jsdom";
import { querySelectorOrThrow } from "./Parser/Selector";
import { Standing } from "./Model/Standing";
import { StandingType } from "./Model/StandingType";

const getStandingType = (input: string): StandingType => {
  if (input.includes("endklassement")) {
    return StandingType.FINAL;
  }

  if (input.includes("regular season")) {
    return StandingType.REGULAR;
  }

  if (input.includes("playoff")) {
    return StandingType.PLAYOFF;
  }

  if (input.includes("final")) {
    return StandingType.FINALS;
  }

  if (input.includes("group a") || input.includes("gruppe a")) {
    return StandingType.GROUP_A;
  }

  if (input.includes("group b") || input.includes("gruppe b")) {
    return StandingType.GROUP_B;
  }

  if (input.includes("group c") || input.includes("gruppe c")) {
    return StandingType.GROUP_C;
  }

  if (input.includes("west")) {
    return StandingType.WEST;
  }

  if (input.includes("mitte") || input.includes("middle")) {
    return StandingType.MIDDLE;
  }

  if (input.includes("east") || input.includes("ost")) {
    return StandingType.EAST;
  }

  return StandingType.UNKNOWN;
};

const IGNORE_TABLES = ["Aktueller Daily Report"].map((v) => v.toLowerCase());

function getTableTitle(table: Element): string {
  for (const selector of ["h1", "h2", "h3"]) {
    const title = table.querySelector(selector)?.textContent;

    if (title) {
      return title;
    }
  }

  return "";
}

export const StandingsCrawler = {
  crawl: async (url: string): Promise<Array<Standing>> => {
    const html = await (await fetch(url, { method: "GET" })).text();
    const dom = new JSDOM(html);

    const tables = dom.window.document.querySelectorAll(
      "div.box-container:has(table)",
    );
    const standings = [];

    for (const table of tables) {
      const tableTitle = getTableTitle(table);

      if (IGNORE_TABLES.includes(tableTitle.toLowerCase())) {
        continue;
      }

      const standingType = getStandingType(tableTitle.toLowerCase());
      const standing: Standing = {
        type: standingType,
        results: [],
      };

      const rows = table.querySelectorAll("table tbody tr");

      for (const [index, row] of rows.entries()) {
        if (row.textContent?.trim() !== "") {
          if (standingType === StandingType.FINAL) {
            if (index > 1) {
              const position = Number.parseInt(
                querySelectorOrThrow(row, "td:nth-child(1)").textContent ||
                  "-1",
              );
              const team = querySelectorOrThrow(
                row,
                "td:nth-child(2) small",
              ).textContent?.trim();
              const wins = Number.parseInt(
                querySelectorOrThrow(
                  row,
                  "td:nth-child(4)",
                ).textContent?.trim() || "0",
              );
              const loses = Number.parseInt(
                querySelectorOrThrow(
                  row,
                  "td:nth-child(5)",
                ).textContent?.trim() || "0",
              );
              const ties = Number.parseInt(
                querySelectorOrThrow(
                  row,
                  "td:nth-child(6)",
                ).textContent?.trim() || "0",
              );

              if (team) {
                standing.results.push({
                  position,
                  team,
                  wins,
                  loses,
                  ties,
                  winsPercentage:
                    Math.round(
                      ((wins + 0.5 * ties) / (wins + loses + ties)) * 1000,
                    ) / 1000,
                });
              }
            }
          } else {
            if (index > 0) {
              const position = Number.parseInt(
                querySelectorOrThrow(row, "td:nth-child(1)").textContent ||
                  "-1",
              );
              const team = querySelectorOrThrow(
                row,
                "td:nth-child(3) small",
              ).textContent?.trim();
              const wins = Number.parseInt(
                querySelectorOrThrow(
                  row,
                  "td:nth-child(4)",
                ).textContent?.trim() || "0",
              );
              const loses = Number.parseInt(
                querySelectorOrThrow(
                  row,
                  "td:nth-child(5)",
                ).textContent?.trim() || "0",
              );
              const ties = Number.parseInt(
                querySelectorOrThrow(
                  row,
                  "td:nth-child(6)",
                ).textContent?.trim() || "0",
              );
              const gamesBehind = Number.parseFloat(
                querySelectorOrThrow(
                  row,
                  "td:nth-child(8)",
                ).textContent?.trim() || "0",
              );

              if (team) {
                standing.results.push({
                  position,
                  team,
                  wins,
                  loses,
                  ties,
                  winsPercentage:
                    Math.round(
                      ((wins + 0.5 * ties) / (wins + loses + ties)) * 1000,
                    ) / 1000,
                  gamesBehind,
                });
              }
            }
          }
        }
      }

      if (standing.results.length > 0) {
        standings.push(standing);
      }
    }

    return standings;
  },
};
