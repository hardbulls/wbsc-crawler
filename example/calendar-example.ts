import {gamesCalendar} from "../src";

(async () => {
    console.log(await gamesCalendar(
        'Baseball Bundesliga 2023',
        'https://www.baseballsoftball.at/de/events/baseball-bundesliga-2023/calendars?round=&team=24492&date=',
        120
    ));
})()

