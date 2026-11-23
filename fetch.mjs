#!/usr/bin/env node
// Reads today's arrivals and departures off the board of Mauritius airport (SSR International,
// MRU), and writes them as JSON:
//
//   data/latest.json            the board as it is now, each flight with its airport
//   data/days/YYYY/DATE.json    every flight of a day, as last seen: the archive
//   data/days/index.json        the days in the archive, with how many flights each has
//   data/airports.json          the airports the board's cities stand for
//
//   node fetch.mjs              read the board and write the files (the scheduled run)
//   node fetch.mjs --dry-run    read and print, write nothing
//
// The board only shows today, so a day's file is the only record of it once the day is over:
// each run merges what it reads into the files of the days its flights are scheduled on.
//
// Zero dependencies: Node 24 built-in fetch only.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { AIRPORTS, airportFor } from './airports.mjs';
import { BOARD_ORIGIN, boardUrl, fetchFlights } from './board.mjs';

const DATA_DIR = new URL('./data/', import.meta.url);
const USER_AGENT = 'mauritius-dataset-flights (+https://github.com/MrSunshyne/mauritius-dataset-flights)';
const dryRun = process.argv.includes('--dry-run');

async function getText(url) {
  // The board takes 10 to 15 seconds a page; a minute is plenty.
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' }, signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
async function readJson(url, fallback) {
  try {
    return JSON.parse(await readFile(url, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

const fetched = new Date().toISOString();
// Each flight with the airport its city stands for: { iata, name, lat, lon }, or null.
const flights = (await fetchFlights(getText)).map((f) => {
  const a = airportFor(f.city);
  return { ...f, airport: a ? { iata: a.iata, name: a.name, lat: a.lat, lon: a.lon } : null };
});
const unknown = [...new Set(flights.filter((f) => !f.airport).map((f) => f.city))];
console.log(`${flights.length} flights: ${flights.filter((f) => f.kind === 'arrival').length} arrivals, ${flights.filter((f) => f.kind === 'departure').length} departures`);
if (unknown.length) console.warn(`No airport for: ${unknown.join(', ')}. Add them to airports.mjs.`);

const latest = { fetched, source: [boardUrl('arrival'), boardUrl('departure')], flights };
if (dryRun) {
  console.log(json(latest));
  process.exit(0);
}

await mkdir(DATA_DIR, { recursive: true });
await writeFile(new URL('latest.json', DATA_DIR), json(latest));
await writeFile(new URL('airports.json', DATA_DIR), json({ source: 'OurAirports (reference points)', airports: Object.values(AIRPORTS).sort((a, b) => a.iata.localeCompare(b.iata)) }));

// The archive: each day's flights, merged with what earlier runs saw. A flight keeps when it
// was first seen on the board, takes the newest of everything else, and says when it was last
// seen, so its last status and times are its final ones once the day is over.
const byDay = Map.groupBy(flights, (f) => f.scheduled.slice(0, 10));
const indexUrl = new URL('days/index.json', DATA_DIR);
const index = new Map((await readJson(indexUrl, { days: [] })).days.map((d) => [d.date, d]));
for (const [day, list] of byDay) {
  const path = `days/${day.slice(0, 4)}/${day}.json`;
  const url = new URL(path, DATA_DIR);
  const old = await readJson(url, { flights: [] });
  const merged = new Map(old.flights.map((f) => [f.id, f]));
  for (const f of list) merged.set(f.id, { ...f, firstSeen: merged.get(f.id)?.firstSeen ?? fetched, lastSeen: fetched });
  const all = [...merged.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.scheduled.localeCompare(b.scheduled) || a.number.localeCompare(b.number));
  await mkdir(new URL('.', url), { recursive: true });
  await writeFile(url, json({ date: day, updated: fetched, source: BOARD_ORIGIN, flights: all }));
  const count = (kind) => all.filter((f) => f.kind === kind).length;
  index.set(day, { date: day, file: path, arrivals: count('arrival'), departures: count('departure'), updated: fetched });
}
// The archive's days, oldest first, so a page can list them without the GitHub API.
await writeFile(indexUrl, json({ updated: fetched, days: [...index.values()].sort((a, b) => a.date.localeCompare(b.date)) }));
console.log(`Wrote data/latest.json and ${byDay.size} day file(s): ${[...byDay.keys()].join(', ')}`);
