# Livescore API

## Methods

### `LivescoreCrawler.crawl()`

Returns a snapshot of all currently active games from the WBSC live feed.

```ts
const games = await LivescoreCrawler.crawl();
```

Returns `Livescore[]`. Each entry contains basic real-time state: score, inning, count, and who is pitching/batting. No detailed play data is included.

---

### `LivescoreCrawler.crawlPlay(gameId)`

Fetches full live play data for a single game. Internally fetches the latest play number, then loads the full play file which contains all plays since the start of the game.

```ts
const play = await LivescoreCrawler.crawlPlay("200334");
```

Returns `LivePlay`.

---

### `LivescoreCrawler.crawlByGameId(gameId)`

Combines the basic livescore with full play data for a single game.

```ts
const game = await LivescoreCrawler.crawlByGameId("200334");
```

Returns `Livescore | null` (null if the game is not found in the live feed). The returned `Livescore` includes the optional `play` field populated with a `LivePlay`.

---

## Types

### `Livescore`

Basic real-time game state, sourced from the global livescores feed.

| Field | Type | Description |
|-------|------|-------------|
| `gameId` | `string` | WBSC game ID |
| `tournamentId` | `string` | WBSC tournament ID |
| `status` | `GameStatus` | Current game status |
| `start` | `Date` | Scheduled start time |
| `inning` | `number \| null` | Current inning number, null if not started |
| `inningHalf` | `"top" \| "bottom" \| null` | Current half-inning |
| `homeRuns` | `number` | Home team runs scored |
| `awayRuns` | `number` | Away team runs scored |
| `balls` | `number` | Current ball count |
| `strikes` | `number` | Current strike count |
| `outs` | `number` | Current out count |
| `runner1` | `boolean` | Runner on first base |
| `runner2` | `boolean` | Runner on second base |
| `runner3` | `boolean` | Runner on third base |
| `pitcher` | `string` | Current pitcher name |
| `batter` | `string` | Current batter name |
| `play` | `LivePlay \| undefined` | Full play data, only present when fetched via `crawlByGameId` |

### `GameStatus`

```ts
enum GameStatus {
  SCHEDULED = "scheduled",
  ONGOING   = "ongoing",
  FINISHED  = "finished",
  SUSPENDED = "suspended",
  CANCELED  = "canceled",
  FORFEIT   = "forfeit",
}
```

---

### `LivePlay`

Full live game data intended for scoreboard/overlay use. Contains the current situation, both lineups, the linescore, and the complete play-by-play history.

| Field | Type | Description |
|-------|------|-------------|
| `gameId` | `string` | WBSC game ID |
| `gameOver` | `boolean` | Whether the game has ended |
| `eventLocation` | `string` | Venue name |
| `eventHome` | `string` | Home team code (e.g. `"SMG"`) |
| `eventAway` | `string` | Away team code |
| `eventHomeId` | `string` | Home team WBSC ID |
| `eventAwayId` | `string` | Away team WBSC ID |
| `regulationInnings` | `number` | Number of regulation innings |
| `lastPlay` | `number` | Index of the most recently loaded play |
| `lastPlayDescription` | `string` | Human-readable description of the last play |
| `situation` | `LivePlaySituation` | Current in-game state |
| `homeLineup` | `LivePlayLineup` | Home team batters and pitchers |
| `awayLineup` | `LivePlayLineup` | Away team batters and pitchers |
| `linescore` | `LivePlayLinescore` | Runs by inning and totals |
| `plays` | `LivePlayEvent[]` | Full play-by-play history, chronological |

---

### `LivePlaySituation`

The current in-game state at the moment of the last play.

| Field | Type | Description |
|-------|------|-------------|
| `currentInning` | `string` | Human-readable inning label (e.g. `"BOT 3"`, `"FINAL"`) |
| `inning` | `number` | Current inning number |
| `inningHalf` | `"top" \| "bottom" \| null` | Current half-inning, null when game is over |
| `batter` | `LivePlayPlayer` | Current batter |
| `batterRecord` | `LivePlayBatterRecord` | Batter's hits and at-bats in this game |
| `batterAverage` | `string` | Batter's season batting average (e.g. `".312"`) |
| `pitcher` | `LivePlayPlayer` | Current pitcher |
| `earnedRunAverage` | `string` | Pitcher's ERA in this game |
| `inningsPitched` | `string` | Pitcher's innings pitched in this game (e.g. `"3.2"`) |
| `pitchSequence` | `LivePlayPitch[]` | Pitches thrown in the current at-bat, chronological |
| `runner1` | `string \| null` | Name of the runner on first, or null if base is empty |
| `runner2` | `string \| null` | Name of the runner on second, or null if base is empty |
| `runner3` | `string \| null` | Name of the runner on third, or null if base is empty |
| `outs` | `number` | Current out count (0–2) |
| `balls` | `number` | Current ball count (0–3) |
| `strikes` | `number` | Current strike count (0–2) |

### `LivePlayPlayer`

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Full display name |
| `playerId` | `string` | WBSC player ID |

### `LivePlayBatterRecord`

| Field | Type | Description |
|-------|------|-------------|
| `hits` | `number` | Hits in this game |
| `atBats` | `number` | At-bats in this game |

### `LivePlayPitch`

One pitch in the current at-bat.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `LivePlayPitchType` | Pitch outcome |
| `description` | `string` | Full label (e.g. `"Ball 2."`, `"Swinging Strike 1."`) |

### `LivePlayPitchType`

```ts
type LivePlayPitchType = "ball" | "strike" | "inPlay" | "event";
```

`"event"` is used for plate-appearance summaries like end-of-inning lines that appear in the sequence.

---

### `LivePlayLineup`

| Field | Type | Description |
|-------|------|-------------|
| `batters` | `LivePlayBatter[]` | Position players in batting order |
| `pitchers` | `LivePlayPitcher[]` | Pitchers who have appeared, in order of appearance |

### `LivePlayBatter`

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Full display name |
| `playerId` | `string` | WBSC player ID |
| `image` | `string` | Photo URL |
| `position` | `string` | Defensive position(s) (e.g. `"SS"`, `"P/1B"`) |
| `plateAppearances` | `number` | Plate appearances in this game |
| `atBats` | `number` | At-bats in this game |
| `runs` | `number` | Runs scored |
| `hits` | `number` | Hits |
| `rbi` | `number` | Runs batted in |
| `walks` | `number` | Walks (BB) |
| `strikeouts` | `number` | Strikeouts |
| `average` | `string` | Batting average in this game (e.g. `".333"`) |

### `LivePlayPitcher`

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Full display name |
| `playerId` | `string` | WBSC player ID |
| `image` | `string` | Photo URL |
| `inningsPitched` | `string` | Innings pitched (e.g. `"4.0"`) |
| `earnedRuns` | `number` | Earned runs allowed |
| `hitsAllowed` | `number` | Hits allowed |
| `walksAllowed` | `number` | Walks issued |
| `strikeouts` | `number` | Strikeouts |
| `earnedRunAverage` | `string` | ERA in this game |

---

### `LivePlayLinescore`

| Field | Type | Description |
|-------|------|-------------|
| `awayRunsByInning` | `(number \| null)[]` | Runs per inning for the away team. Index 0 is always null (1-based innings). |
| `homeRunsByInning` | `(number \| null)[]` | Runs per inning for the home team. Same structure. |
| `awayTotals` | `LivePlayLinescoreTotals` | Away team game totals |
| `homeTotals` | `LivePlayLinescoreTotals` | Home team game totals |

### `LivePlayLinescoreTotals`

| Field | Type | Description |
|-------|------|-------------|
| `runs` | `number` | Total runs scored |
| `hits` | `number` | Total hits |
| `errors` | `number` | Total errors |

---

### `LivePlayEvent`

One entry in the play-by-play history. The `plays` array is in chronological order (oldest first).

| Field | Type | Description |
|-------|------|-------------|
| `description` | `string` | Human-readable play description (e.g. `"JONES singles to left field."`) |
| `inning` | `number` | Inning the play occurred in |
| `inningHalf` | `"top" \| "bottom" \| null` | Half-inning the play occurred in |
| `pitchOutcome` | `LivePlayPitchOutcome` | Machine-readable outcome of the pitch |

### `LivePlayPitchOutcome`

```ts
type LivePlayPitchOutcome =
  | "ball"
  | "calledStrike"
  | "swingingStrike"
  | "foul"
  | "inPlay"
  | "unknown";
```

Derived from an internal animation code (`r1`) present on every play entry. Reliable for distinguishing the six pitch outcome categories. For finer detail within `"inPlay"` (single vs double, hit vs out) or within `"ball"` (wild pitch, passed ball, intentional), the `description` string is the only source.

| Value | Meaning |
|-------|---------|
| `"ball"` | Ball, including any baserunner advances on wild pitch / passed ball |
| `"calledStrike"` | Called strike, including strikeout looking as the final pitch |
| `"swingingStrike"` | Swinging strike, including strikeout swinging as the final pitch |
| `"foul"` | Foul ball |
| `"inPlay"` | Ball put in play — hit or out |
| `"unknown"` | Inning summaries, game start/end markers, and any unmapped codes |
