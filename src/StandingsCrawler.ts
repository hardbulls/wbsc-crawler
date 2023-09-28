import {JSDOM} from 'jsdom';
import {querySelectorOrThrow} from "./Parser/Selector";
import {Standing} from "./Model/Standing";


export const StandingsCrawler = {
    crawl: async (url: string): Promise<Array<Standing>> => {
        const html = await (await fetch(url, {method: 'GET'})).text()
        const dom = new JSDOM(html);

        const rows = dom.window.document.querySelectorAll('table.standings-print tbody tr')

        const standings = [];

        for (const [index, row] of rows.entries()) {
            if (index > 0) {
                const position = Number.parseInt(querySelectorOrThrow(row, 'td:nth-child(1)').textContent || '-1');
                const team = querySelectorOrThrow(row, 'td:nth-child(3) small').textContent?.trim();
                const wins = Number.parseInt(querySelectorOrThrow(row, 'td:nth-child(4)').textContent?.trim() || '0');
                const loses = Number.parseInt(querySelectorOrThrow(row, 'td:nth-child(5)').textContent?.trim() || '0');
                const ties = Number.parseInt(querySelectorOrThrow(row, 'td:nth-child(6)').textContent?.trim() || '0');
                const gamesBehind = Number.parseFloat(querySelectorOrThrow(row, 'td:nth-child(8)').textContent?.trim() || '0');

                if (team) {
                    standings.push({
                        position,
                        team,
                        wins,
                        loses,
                        ties,
                        winsPercentage: Math.round(((wins + (0.5 * ties)) / (wins + loses + ties)) * 1000) / 1000,
                        gamesBehind
                    })
                }
            }
        }

        return standings
    }
}
