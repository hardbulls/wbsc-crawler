import { JSDOM } from 'jsdom';
import { querySelectorOrThrow } from "./Parser/Selector";
import { Standing } from "./Model/Standing";
import { StandingType } from './Model/StandingType';

const getStandingType = (input: string): StandingType => {
    if (input.includes('endklassement')) {
        return StandingType.FINAL
    }

    if (input.includes('regular season')) {
        return StandingType.REGULAR
    }


    if (input.includes('group a')) {
        return StandingType.GROUP_A
    }


    if (input.includes('group b')) {
        return StandingType.GROUP_B
    }

    if (input.includes('group c')) {
        return StandingType.GROUP_C
    }

    return StandingType.UNKNOWN;
}

export const StandingsCrawler = {
    crawl: async (url: string): Promise<Array<Standing>> => {
        const html = await (await fetch(url, { method: 'GET' })).text()
        const dom = new JSDOM(html);

        const tables = dom.window.document.querySelectorAll('div.box-container:has(table)')

        const standings = [];
        for (const table of tables) {
            const tableTitle = table.querySelector('h3')?.textContent || '';
            const standingType = getStandingType(tableTitle.toLowerCase());

            const rows = dom.window.document.querySelectorAll('table.standings-print tbody tr')

            for (const [index, row] of rows.entries()) {
                if (row.textContent?.trim() !== '') {


                    if (index > 0) {
                        const position = Number.parseInt(querySelectorOrThrow(row, 'td:nth-child(1)').textContent || '-1');
                        const team = querySelectorOrThrow(row, 'td:nth-child(3) small').textContent?.trim();
                        const wins = Number.parseInt(querySelectorOrThrow(row, 'td:nth-child(4)').textContent?.trim() || '0');
                        const loses = Number.parseInt(querySelectorOrThrow(row, 'td:nth-child(5)').textContent?.trim() || '0');
                        const ties = Number.parseInt(querySelectorOrThrow(row, 'td:nth-child(6)').textContent?.trim() || '0');
                        const gamesBehind = Number.parseFloat(querySelectorOrThrow(row, 'td:nth-child(8)').textContent?.trim() || '0');

                        if (team) {
                            standings.push({
                                type: standingType,
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
            }
        }


        return standings
    }

}
