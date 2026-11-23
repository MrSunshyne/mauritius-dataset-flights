# Mauritius Flights Dataset

Arrivals and departures at Mauritius airport (Sir Seewoosagur Ramgoolam International, MRU), as JSON. Each flight has its number and codeshares, airline, the city it comes from or goes to, with that airport's code and position, the scheduled time, the estimated or actual time, and its status.

A GitHub Action reads the airport's board every 10 minutes (GitHub often starts scheduled runs late, or skips one, so expect 10 to 20 minutes) and commits whatever changed. The board only ever shows today, so the daily files here are its only record once the day is over. The archive starts on 23 November 2026.

The site built on this data is [moris3d.ramgolam.com/flights](https://moris3d.ramgolam.com/flights): the day's flights in 3D over the island, each on a path estimated from its times.

## Where the flights come from

The [arrivals](https://mru.airport.aero/passengers/flights/flight-arrival-search) and [departures](https://mru.airport.aero/passengers/flights/flight-departure-search) boards of Airport Terminal Operations Ltd, the same lists as the screens in the terminal. They are read as published; nothing is added but the airport each city stands for.

The board shows 30 flights to a page, in scheduled order, but flights at the same minute come in no fixed order, so paging through it can show one twice and lose another. `board.mjs` reads the first page oldest first and the first page newest first (up to 60 flights a day, a busy day at MRU), plus any pages in between.

Airport positions are the reference points from [OurAirports](https://ourairports.com/data/) (public domain), in `airports.mjs`, with the board's spellings of each city ("St Denis Reunion", "Mahe Island", "Paris CDG").

### Limits

- **Today only.** The board has no tomorrow and no history, so the archive only has what the scraper saw. A run that GitHub skipped or delayed can miss a status in between: the files keep the last one seen.
- **Times are the board's.** For an arrival, "Arrived 07:04" is when it reached its stand. For a departure, "Take Off 15:29" is when it left the ground. An estimated time ("Delayed 16:50", "Expected 12:05") can change many times, and only the latest is kept.
- **No aircraft type, registration or position.** The board doesn't give them. No open ADS-B network has a receiver within range of Mauritius, so live positions aren't available either.

## Files

All files are at

```
https://raw.githubusercontent.com/MrSunshyne/mauritius-dataset-flights/main/data/{file}
```

| File | Use |
|---|---|
| [`data/latest.json`](data/latest.json) | The board as it is now: today's flights, for a live display |
| `data/days/YYYY/YYYY-MM-DD.json` | Every flight scheduled that day, as last seen: the archive, for punctuality, routes and traffic over time |
| [`data/airports.json`](data/airports.json) | The airports the board's cities stand for, with their positions |

### A flight

```json
{
  "id": "a-MK015-2026-11-23",
  "kind": "arrival",
  "number": "MK015",
  "codeshares": ["AF7964", "KL3848"],
  "airline": "Air Mauritius",
  "city": "Paris CDG",
  "stops": ["Paris CDG"],
  "scheduled": "2026-11-23T07:15:00+04:00",
  "estimated": null,
  "actual": "2026-11-23T07:04:00+04:00",
  "status": "arrived",
  "statusText": "Arrived",
  "belt": "04-05",
  "gate": null,
  "airport": { "iata": "CDG", "name": "Paris CDG", "lat": 49.009, "lon": 2.5541 }
}
```

| Field | |
|---|---|
| `id` | `a-` or `d-`, the flight number and the scheduled date: unique and stable through the day |
| `kind` | `arrival` or `departure` |
| `number`, `codeshares` | The operating flight number, and the others sold on it |
| `airline` | The operating airline, as the board names it |
| `city`, `stops` | The board's words for where it comes from or goes to. A departure with stops lists them all in `stops`; `city` is the first stop for a departure and the last for an arrival: the airport next to Mauritius on the route |
| `scheduled` | Scheduled time, ISO 8601 in Mauritius time (UTC+4, no summer time) |
| `estimated` | The board's latest expected time, or `null` |
| `actual` | When it happened: on its stand (arrivals) or off the ground (departures), or `null` |
| `status` | `scheduled`, `estimated`, `delayed`, `boarding`, `gate-closed`, `departed`, `landed`, `arrived`, `cancelled`, `diverted` or `unknown`; `statusText` is the board's own words |
| `belt`, `gate` | Baggage belt (arrivals) and gate (departures) when shown |
| `airport` | `{ iata, name, lat, lon }` of the airport `city` stands for, or `null` for a city `airports.mjs` doesn't know yet |

In a day's file each flight also has `firstSeen` and `lastSeen`: when a run first and last saw it on the board.

## Running it

```sh
node fetch.mjs            # read the board, write data/
node fetch.mjs --dry-run  # read and print, write nothing
```

Node 24, no dependencies. A run takes 10 to 20 seconds: the board is slow. When a scheduled run fails, the workflow opens an issue, and closes it after the next run that works.

## Licence

The code is MIT. The flight data is the airport's, republished as read from its public board.
