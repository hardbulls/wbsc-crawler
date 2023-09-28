import ical from "ical-generator"
import {getVtimezoneComponent} from "@touch4it/ical-timezones"
import {Game} from "../Model/Game";

const changeTimezone = (date: Date, ianatz: string) => {
    const invdate = new Date(
        date.toLocaleString("en-US", {
            timeZone: ianatz,
        })
    )

    const diff = date.getTime() - invdate.getTime()

    return new Date(date.getTime() - diff)
}

export const IcalGenerator = {
    games: (name: string, games: Game[], timezone: string, gameDurationInMinutes: number) => {
        const calendar = ical({ name })
        calendar.timezone({
            name: timezone,
            generator: getVtimezoneComponent,
        })

        for (const game of games) {
            const end = new Date()

            end.setTime(game.date.getTime() + gameDurationInMinutes * 60 * 1000)

            const location = game.venue;
            const description = `${game.away} - ${game.home}`
            const summary = description

            calendar.createEvent({
                start: changeTimezone(game.date, "UTC"),
                end: changeTimezone(end, "UTC"),
                summary,
                description,
                location,
                timezone: timezone,
            })
        }

        return calendar.toString();
    }
}
