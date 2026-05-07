import { LivescoreCrawler } from "../src";
import { inspect } from "util";

(async () => {
  const livescores = await LivescoreCrawler.crawl();

  console.log(
    inspect(livescores, { showHidden: false, depth: null, colors: true }),
  );
})();
