import { JSDOM } from "jsdom";
import { fetchUrl } from "./fetch";
import { PlayerStatistics } from "./Model/PlayerStatistics";

const pitchingKeyMap: Record<string, string> = {
  pitch_win: "w",
  pitch_loss: "l",
  pitch_appear: "g",
  pitch_gs: "gs",
  pitch_cg: "cg",
  pitch_sho: "sho",
  pitch_save: "sv",
  pitch_ip: "ip",
  pitch_r: "r",
  pitch_er: "er",
  pitch_h: "h",
  pitch_bb: "bb",
  pitch_so: "so",
  pitch_double: "2b",
  pitch_triple: "3b",
  pitch_hr: "hr",
  pitch_ab: "ab",
  bavg: "bavg",
  pitch_wp: "wp",
  pitch_hbp: "hbp",
  pitch_bk: "bk",
  pitch_sfa: "sf",
  pitch_sha: "sh",
  pitch_whip: "whip",
  era: "era",
};

const battingKeyMap: Record<string, string> = {
  g: "g",
  gs: "gs", // optional, not in original but you might want to keep
  ab: "ab",
  r: "r",
  h: "h",
  double: "2b",
  triple: "3b",
  hr: "hr",
  rbi: "rbi",
  tb: "tb", // optional, not in original
  avg: "avg",
  slg: "slg",
  obp: "obp",
  ops: "ops",
  bb: "bb",
  hbp: "hp", // renamed from hbp to hp
  so: "so",
  gdp: "gdp",
  sf: "sf",
  sh: "sh",
  sb: "sb",
  cs: "cs",
  // "pa" and "ibb" are not present in new format — keep that in mind
};

const fieldingKeyMap: Record<string, string> = {
  field_g: "g",
  field_c: "c",
  field_po: "po",
  field_a: "a",
  field_e: "e",
  fldp: "fldp",
  field_dp: "dp",
  field_sba: "sba",
  field_csb: "csb",
  sbap: "sbap",
  field_pb: "pb",
  field_ci: "ci",
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

export const JsonStatisticsCrawler = {
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
      ...new Set([
        ...Object.keys(battingStatistics),
        ...Object.keys(pitchingStatistics),
        ...Object.keys(fieldingStatistics),
      ]),
    ];

    const result: PlayerStatistics[] = [];

    for (const name of names) {
      const playerStatistics = {
        name,
        statistics: {
          batting:
            (battingStatistics[name] &&
              battingStatistics[name].statistics &&
              normalizeBattingStats(battingStatistics[name].statistics)) ||
            {},
          pitching:
            (pitchingStatistics[name] &&
              pitchingStatistics[name].statistics &&
              normalizePitchingStats(pitchingStatistics[name].statistics)) ||
            {},
          fielding:
            (fieldingStatistics[name] &&
              fieldingStatistics[name].statistics &&
              normalizeFieldingStats(fieldingStatistics[name].statistics)) ||
            {},
        },
      };

      result.push(playerStatistics);
    }

    return result;
  },
};

const crawlUrl = async (url: string) => {
  const response = await fetchUrl(url, { method: "GET" });
  const json = await response.json();

  const params = new URLSearchParams(url.split("?")[1]);
  const teamId = params.has("team") ? parseInt(params.get("team")!, 10) : null;

  const results: { [key: string]: StatisticsResult } = {};

  for (const playerData of json.data) {
    if (teamId && playerData.teamid !== teamId) {
      continue;
    }

    const name = parseName(playerData.name);
    const statistics: { [key: string]: number } = {};

    for (const [key, value] of Object.entries(playerData)) {
      if (
        key !== "name" &&
        key !== "link" &&
        key !== "teamid" &&
        key !== "teamcode" &&
        typeof value === "number"
      ) {
        statistics[key] =
          key === "avg" ||
          key === "slg" ||
          key === "obp" ||
          key === "ops" ||
          key === "fldp" ||
          key === "bavg"
            ? value / 1000 // normalize from 500 => 0.500
            : value;
      }
    }

    results[name] = {
      name,
      statistics,
    };
  }

  return results;
};

const parseName = (html: string): string => {
  const dom = new JSDOM(html);
  const last = dom.window.document
    .querySelector(".lastname")
    ?.textContent?.trim();
  const first = dom.window.document
    .querySelector(".firstname")
    ?.textContent?.trim();

  const capitalizeWords = (s?: string) =>
    s
      ? s
          .split(/\s+/)
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ")
      : "";

  return [capitalizeWords(first), capitalizeWords(last)]
    .filter(Boolean)
    .join(" ");
};

const normalizePitchingStats = (rawStats: Record<string, number | string>) => {
  const normalized: Record<string, number> = {};

  for (const [newKey, originalKey] of Object.entries(pitchingKeyMap)) {
    if (rawStats[newKey] != null) {
      const value = rawStats[newKey];
      normalized[originalKey] =
        typeof value === "string" ? parseFloat(value) : value;
    }
  }

  return normalized;
};

const normalizeBattingStats = (rawStats: Record<string, number | string>) => {
  const normalized: Record<string, number> = {};

  for (const [newKey, originalKey] of Object.entries(battingKeyMap)) {
    if (rawStats[newKey] != null) {
      const value = rawStats[newKey];
      normalized[originalKey] =
        typeof value === "string" ? Number.parseFloat(value) : value;
    }
  }

  return normalized;
};

const normalizeFieldingStats = (rawStats: Record<string, number | string>) => {
  const normalized: Record<string, number> = {};

  for (const [newKey, originalKey] of Object.entries(fieldingKeyMap)) {
    if (rawStats[newKey] != null) {
      const value = rawStats[newKey];
      normalized[originalKey] =
        typeof value === "string" ? Number.parseFloat(value) : value;
    } else {
      // If missing, but required field
      normalized[originalKey] = 0;
    }
  }

  return normalized;
};
