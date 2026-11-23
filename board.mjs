// The flight board of Mauritius airport (mru.airport.aero), read into plain flights.
//
// The board is a Drupal view: today's flights only (no tomorrow), 30 to a page, ordered by
// scheduled time. That order is not stable among flights at the same minute, so the pages of
// one listing can repeat one flight and lose another at their seam. Asking for the same view
// newest first (`order=…&sort=desc`) is reliable instead: its first page, with the oldest-first
// first page, holds a whole day of up to 60 flights, which is a busy day at MRU. Longer days
// add the middle pages, oldest first.
//
// No dependencies: fetch.mjs reads the board with it, and any script can too.

export const BOARD_ORIGIN = 'https://mru.airport.aero';
const BOARDS = {
  arrival: { path: '/passengers/flights/flight-arrival-search', sortField: 'field_horarr' },
  departure: { path: '/passengers/flights/flight-departure-search', sortField: 'field_hordep' },
};
const PAGE_SIZE = 30;

export function boardUrl(kind, { desc = false, page = 0 } = {}) {
  const { path, sortField } = BOARDS[kind];
  const query = new URLSearchParams();
  if (desc) query.set('order', sortField), query.set('sort', 'desc');
  if (page) query.set('page', String(page));
  const qs = query.toString();
  return `${BOARD_ORIGIN}${path}${qs ? `?${qs}` : ''}`;
}

// Every flight on both boards, sorted by scheduled time. `getText(url)` fetches a page's HTML
// and throws when it cannot, which fails the whole read: half a board is worse than none.
export async function fetchFlights(getText) {
  const kinds = Object.keys(BOARDS);
  const firsts = await Promise.all(kinds.flatMap((kind) => [getText(boardUrl(kind)), getText(boardUrl(kind, { desc: true }))]));
  const lists = [];
  const middles = [];
  kinds.forEach((kind, i) => {
    const asc = firsts[2 * i];
    const desc = firsts[2 * i + 1];
    lists.push(parseBoard(asc, kind), parseBoard(desc, kind));
    for (let page = 1; page < lastPage(asc); page++) middles.push(getText(boardUrl(kind, { page })).then((html) => parseBoard(html, kind)));
  });
  lists.push(...(await Promise.all(middles)));
  return mergeFlights(lists);
}

// The index of a board page's last page, from its pager: 0 when it has no pager.
export function lastPage(html) {
  const m = html.match(/pager-last[^>]*>\s*<a[^>]*href="[^"]*[?&;]page=(\d+)/);
  return m ? Number(m[1]) : 0;
}

// The flights of one page, one per row, in the page's order. Throws when the page is not a board.
export function parseBoard(html, kind) {
  // A board with no flights has the view but no table; a page without the view is not a board.
  if (!html.includes('view-flight-')) throw new Error(`no ${kind} board on the page`);
  if (!html.includes('<tbody>')) return [];
  const body = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'));
  const rows = body.split('<tr').slice(1);
  const flights = [];
  for (const row of rows) {
    const flight = parseRow(row, kind);
    if (flight) flights.push(flight);
  }
  // Rows but no flights: the board's layout has changed under the parser.
  if (rows.length && !flights.length) throw new Error(`unreadable ${kind} board`);
  return flights;
}

// One flight per id, the later list's copy winning, sorted by scheduled time and number.
export function mergeFlights(lists) {
  const byId = new Map();
  for (const list of lists) for (const f of list) byId.set(f.id, f);
  return [...byId.values()].sort((a, b) => a.scheduled.localeCompare(b.scheduled) || a.number.localeCompare(b.number));
}

// A row's cells, by the field each shows: scheduled time and date, airline(s), flight
// number(s), city or cities, belt (arrivals) or check-in and gate (departures), and status.
function parseRow(row, kind) {
  const cells = {};
  let last = '';
  // A sorted column's cells also carry `active`.
  for (const m of row.matchAll(/<td class="views-field views-field-([\w-]+)[^"]*"[^>]*>([\s\S]*?)<\/td>/g)) cells[m[1]] = last = m[2];
  const when = cells['field-horarr'] ?? cells['field-hordep'] ?? '';
  const time = hhmm(when);
  const dmy = text(when).match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const numbers = divTexts(cells['field-numvol'] ?? '').map((n) => n.replace(/\s+/g, '').toUpperCase());
  if (!time || !dmy || !numbers.length) return null;
  const day = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const scheduled = localIso(day, time);

  const airlines = divTexts(cells['field-name-of-airline'] ?? '');
  // Departures list each stop in its own span, in flying order; arrivals give one city.
  const cityCell = cells['field-nom-l1'] ?? '';
  const stops = cityCell.includes('airport-disp') ? spanTexts(cityCell, 'airport-disp') : [text(cityCell)].filter(Boolean);
  // The airport next to Mauritius on the route: the first stop out, the last stop in.
  const city = (kind === 'departure' ? stops[0] : stops[stops.length - 1]) ?? '';

  // The status cell is the row's last: a word ("Arrived", "Delayed") and maybe a time.
  const statusText = text(last.match(/views-field-field-libelle-l2[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '');
  const statusTime = hhmm(last.replace(/<div[^>]*views-field-field-libelle-l2[\s\S]*?<\/div>/, ''));
  const { status, actual: isActual } = readStatus(statusText, Boolean(statusTime));
  const at = statusTime ? nearIso(day, time, statusTime) : null;

  const info = cells.php ?? cells.nothing ?? '';
  return {
    id: `${kind[0]}-${numbers[0]}-${day}`,
    kind,
    number: numbers[0],
    codeshares: numbers.slice(1),
    airline: airlineName(airlines[0] ?? ''),
    city,
    stops,
    scheduled,
    estimated: at && !isActual ? at : null,
    actual: at && isActual ? at : null,
    status,
    statusText,
    belt: kind === 'arrival' ? text(info).replace(/^belt\s*/i, '') || null : null,
    gate: text(info.match(/class=['"]gate['"]>([^<]*)/)?.[1] ?? '') || null,
  };
}

// The board's status words, English or French, to the page's states. `actual` says the
// status time is when it happened rather than when it is expected.
const STATUSES = [
  [/cancel|annul/, 'cancelled', false],
  [/divert|d[eé]rout/, 'diverted', false],
  [/arriv|on block|on stand/, 'arrived', true],
  [/land|atterri/, 'landed', true],
  [/take ?off|depart|airborne|d[eé]coll|parti/, 'departed', true],
  // Check-in comes before the gates: "Check-in closed" is long before the gate closes.
  [/check|enreg/, 'scheduled', false],
  [/gate clos|closed|ferm/, 'gate-closed', false],
  [/board|final call|last call|gate open|embarq/, 'boarding', false],
  [/delay|retard|reschedul|new time/, 'delayed', false],
  [/expect|estimat|on time|[aà] l'heure|pr[eé]vu|attendu|confirm/, 'scheduled', false],
];

function readStatus(words, hasTime) {
  const w = words.toLowerCase();
  if (!w) return { status: hasTime ? 'estimated' : 'scheduled', actual: false };
  for (const [re, status, actual] of STATUSES) {
    if (!re.test(w)) continue;
    // A time with a word that does not otherwise change the plan is a new estimate.
    return { status: status === 'scheduled' && hasTime ? 'estimated' : status, actual };
  }
  return { status: 'unknown', actual: false };
}

// Board times are Mauritius time, UTC+4 all year (no summer time).
const localIso = (day, time) => `${day}T${time}:00+04:00`;

// A status time on the day that puts it nearest the scheduled time: a flight due at 23:50
// that arrived at 00:20 arrived the next day, one due at 00:10 that left at 23:55 the day
// before. Half a day either way is the limit, far beyond the usual delay.
function nearIso(day, scheduled, time) {
  const minutes = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const diff = minutes(time) - minutes(scheduled);
  const shift = diff < -12 * 60 ? 1 : diff > 12 * 60 ? -1 : 0;
  if (!shift) return localIso(day, time);
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + shift);
  return localIso(d.toISOString().slice(0, 10), time);
}

// "AIR MAURITIUS" → "Air Mauritius", keeping the names that are not written that way.
const AIRLINE_WORDS = { KLM: 'KLM', ITA: 'ITA', LAM: 'LAM', TAAG: 'TAAG', FLYSAFAIR: 'FlySafair', INDIGO: 'IndiGo', FLYDUBAI: 'flydubai', AIRLINK: 'Airlink' };
const airlineName = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => AIRLINE_WORDS[w.toUpperCase()] ?? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

const hhmm = (html) => text(html).match(/\b(\d{2}):(\d{2})\b/)?.[0] ?? null;
const divTexts = (html) => [...html.matchAll(/<div class="(?:top|below)-flight-num">([\s\S]*?)<\/div>/g)].map((m) => text(m[1])).filter(Boolean);
const spanTexts = (html, cls) => [...html.matchAll(new RegExp(`<(?:span|div) class="${cls}">([\\s\\S]*?)</(?:span|div)>`, 'g'))].map((m) => text(m[1])).filter(Boolean);

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const text = (html) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) =>
      e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m),
    )
    .replace(/\s+/g, ' ')
    .trim();
