import {crawl} from "../src";

(async () => {
    const {games, standings} = await crawl({
        standings: 'https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/standings',
        games: 'https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/calendars?round=&team=24492&date='
    })

    console.log(games, standings)
})()
