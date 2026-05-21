import { LivescoreCrawler } from "../src";
import { inspect } from "util";

const GAME_ID = "200334";

(async () => {
  const play = await LivescoreCrawler.crawlPlay(GAME_ID);

  const { situation, linescore, homeLineup, awayLineup, plays } = play;

  console.log(`\n=== ${play.eventAway} @ ${play.eventHome} — ${play.eventLocation} ===`);
  console.log(`Status: ${play.gameOver ? "Final" : situation.currentInning}`);

  console.log(`\n--- Linescore ---`);
  const innings = linescore.homeRunsByInning.slice(1).map((_, i) => String(i + 1).padStart(3));
  console.log(`     ${innings.join("")}   R  H  E`);
  console.log(`${play.eventAway.padEnd(5)}${linescore.awayRunsByInning.slice(1).map((r) => String(r ?? "X").padStart(3)).join("")}  ${linescore.awayTotals.runs.toString().padStart(2)} ${linescore.awayTotals.hits.toString().padStart(2)} ${linescore.awayTotals.errors.toString().padStart(2)}`);
  console.log(`${play.eventHome.padEnd(5)}${linescore.homeRunsByInning.slice(1).map((r) => String(r ?? "X").padStart(3)).join("")}  ${linescore.homeTotals.runs.toString().padStart(2)} ${linescore.homeTotals.hits.toString().padStart(2)} ${linescore.homeTotals.errors.toString().padStart(2)}`);

  console.log(`\n--- Current Situation ---`);
  console.log(`Inning : ${situation.currentInning}`);
  console.log(`Batter : ${situation.batter.name} (${situation.batterRecord.hits}-for-${situation.batterRecord.atBats}, avg ${situation.batterAverage})`);
  console.log(`Pitcher: ${situation.pitcher.name} (${situation.inningsPitched} IP, ERA ${situation.earnedRunAverage})`);
  console.log(`Count  : ${situation.balls}-${situation.strikes}, ${situation.outs} out(s)`);
  console.log(`Bases  : 1B=${situation.runner1 ?? "—"}  2B=${situation.runner2 ?? "—"}  3B=${situation.runner3 ?? "—"}`);
  console.log(`Pitches: ${situation.pitchSequence.map((p) => p.type).join(", ")}`);

  console.log(`\n--- ${play.eventAway} Lineup ---`);
  for (const batter of awayLineup.batters) {
    console.log(`  ${batter.position.padEnd(6)} ${batter.name.padEnd(30)} ${batter.hits}-${batter.atBats}  avg ${batter.average}`);
  }
  for (const pitcher of awayLineup.pitchers) {
    console.log(`  P      ${pitcher.name.padEnd(30)} ${pitcher.inningsPitched} IP  ERA ${pitcher.earnedRunAverage}`);
  }

  console.log(`\n--- ${play.eventHome} Lineup ---`);
  for (const batter of homeLineup.batters) {
    console.log(`  ${batter.position.padEnd(6)} ${batter.name.padEnd(30)} ${batter.hits}-${batter.atBats}  avg ${batter.average}`);
  }
  for (const pitcher of homeLineup.pitchers) {
    console.log(`  P      ${pitcher.name.padEnd(30)} ${pitcher.inningsPitched} IP  ERA ${pitcher.earnedRunAverage}`);
  }

  console.log(`\n--- Play by Play (last 10) ---`);
  for (const event of plays.slice(-10)) {
    console.log(`  [Inn ${event.inning} ${(event.inningHalf ?? "").padEnd(6)}] ${event.description}`);
  }

  console.log(`\n--- Full LivePlay object ---`);
  console.log(inspect(play, { showHidden: false, depth: null, colors: true }));
})();
