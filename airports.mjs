// The airports flights at Mauritius (SSR, MRU) come from and go to. The airport board names
// them by city, in its own words ("St Denis Reunion", "Paris CDG", "Seychelles"), so
// airportFor() reads those words, and their usual variants, back to an airport.
//
// Positions are the airports' reference points (OurAirports), to 4 decimals: about 10 m.
// A city that isn't here gets no airport in the data; add it (and an alias if the board's
// words differ from its name) when the scrape's log names one.

export const AIRPORTS = {
  // The Indian Ocean islands.
  RUN: { iata: 'RUN', name: 'St Denis, Réunion', lat: -20.8901, lon: 55.5189 },
  ZSE: { iata: 'ZSE', name: 'St Pierre, Réunion', lat: -21.3194, lon: 55.4225 },
  RRG: { iata: 'RRG', name: 'Rodrigues', lat: -19.7577, lon: 63.361 },
  SEZ: { iata: 'SEZ', name: 'Mahé, Seychelles', lat: -4.6743, lon: 55.5218 },
  TNR: { iata: 'TNR', name: 'Antananarivo', lat: -18.7969, lon: 47.4788 },
  NOS: { iata: 'NOS', name: 'Nosy Be', lat: -13.3121, lon: 48.3148 },
  TMM: { iata: 'TMM', name: 'Toamasina', lat: -18.1135, lon: 49.3923 },
  DZA: { iata: 'DZA', name: 'Mayotte', lat: -12.8093, lon: 45.2818 },
  HAH: { iata: 'HAH', name: 'Moroni', lat: -11.5337, lon: 43.2719 },
  MLE: { iata: 'MLE', name: 'Malé', lat: 4.1918, lon: 73.5291 },
  // Africa.
  JNB: { iata: 'JNB', name: 'Johannesburg', lat: -26.1401, lon: 28.2468 },
  CPT: { iata: 'CPT', name: 'Cape Town', lat: -33.974, lon: 18.6043 },
  DUR: { iata: 'DUR', name: 'Durban', lat: -29.6134, lon: 31.1179 },
  NBO: { iata: 'NBO', name: 'Nairobi', lat: -1.3189, lon: 36.9282 },
  ADD: { iata: 'ADD', name: 'Addis Ababa', lat: 8.9779, lon: 38.7993 },
  MPM: { iata: 'MPM', name: 'Maputo', lat: -25.9208, lon: 32.5726 },
  HRE: { iata: 'HRE', name: 'Harare', lat: -17.9318, lon: 31.0928 },
  LUN: { iata: 'LUN', name: 'Lusaka', lat: -15.3308, lon: 28.4527 },
  DAR: { iata: 'DAR', name: 'Dar es Salaam', lat: -6.8735, lon: 39.2073 },
  // The Gulf and the Middle East.
  DXB: { iata: 'DXB', name: 'Dubai', lat: 25.2498, lon: 55.371 },
  DOH: { iata: 'DOH', name: 'Doha', lat: 25.2731, lon: 51.6081 },
  AUH: { iata: 'AUH', name: 'Abu Dhabi', lat: 24.441, lon: 54.6492 },
  JED: { iata: 'JED', name: 'Jeddah', lat: 21.6802, lon: 39.1574 },
  RUH: { iata: 'RUH', name: 'Riyadh', lat: 24.9576, lon: 46.6988 },
  MCT: { iata: 'MCT', name: 'Muscat', lat: 23.6002, lon: 58.2853 },
  IST: { iata: 'IST', name: 'Istanbul', lat: 41.2749, lon: 28.7321 },
  SAW: { iata: 'SAW', name: 'Istanbul Sabiha Gökçen', lat: 40.8986, lon: 29.3092 },
  // Europe.
  CDG: { iata: 'CDG', name: 'Paris CDG', lat: 49.009, lon: 2.5541 },
  ORY: { iata: 'ORY', name: 'Paris Orly', lat: 48.7295, lon: 2.359 },
  LHR: { iata: 'LHR', name: 'London Heathrow', lat: 51.4707, lon: -0.4599 },
  LGW: { iata: 'LGW', name: 'London Gatwick', lat: 51.1487, lon: -0.1857 },
  FRA: { iata: 'FRA', name: 'Frankfurt', lat: 50.0267, lon: 8.5584 },
  MUC: { iata: 'MUC', name: 'Munich', lat: 48.3538, lon: 11.7861 },
  DUS: { iata: 'DUS', name: 'Düsseldorf', lat: 51.2895, lon: 6.7668 },
  VIE: { iata: 'VIE', name: 'Vienna', lat: 48.1103, lon: 16.5697 },
  ZRH: { iata: 'ZRH', name: 'Zurich', lat: 47.4581, lon: 8.5481 },
  GVA: { iata: 'GVA', name: 'Geneva', lat: 46.2381, lon: 6.109 },
  FCO: { iata: 'FCO', name: 'Rome', lat: 41.8045, lon: 12.252 },
  MXP: { iata: 'MXP', name: 'Milan Malpensa', lat: 45.6306, lon: 8.7281 },
  AMS: { iata: 'AMS', name: 'Amsterdam', lat: 52.3086, lon: 4.7639 },
  BRU: { iata: 'BRU', name: 'Brussels', lat: 50.9014, lon: 4.4844 },
  MRS: { iata: 'MRS', name: 'Marseille', lat: 43.4381, lon: 5.2125 },
  TLS: { iata: 'TLS', name: 'Toulouse', lat: 43.6291, lon: 1.3638 },
  LYS: { iata: 'LYS', name: 'Lyon', lat: 45.726, lon: 5.0901 },
  NTE: { iata: 'NTE', name: 'Nantes', lat: 47.1532, lon: -1.6107 },
  BOD: { iata: 'BOD', name: 'Bordeaux', lat: 44.8287, lon: -0.7154 },
  MAD: { iata: 'MAD', name: 'Madrid', lat: 40.4934, lon: -3.5722 },
  LIS: { iata: 'LIS', name: 'Lisbon', lat: 38.7813, lon: -9.1359 },
  WAW: { iata: 'WAW', name: 'Warsaw', lat: 52.1657, lon: 20.9671 },
  PRG: { iata: 'PRG', name: 'Prague', lat: 50.1009, lon: 14.2599 },
  SVO: { iata: 'SVO', name: 'Moscow', lat: 55.9775, lon: 37.3867 },
  // South Asia.
  BOM: { iata: 'BOM', name: 'Mumbai', lat: 19.0887, lon: 72.8679 },
  DEL: { iata: 'DEL', name: 'Delhi', lat: 28.5556, lon: 77.0952 },
  BLR: { iata: 'BLR', name: 'Bangalore', lat: 13.1979, lon: 77.7063 },
  MAA: { iata: 'MAA', name: 'Chennai', lat: 12.99, lon: 80.1693 },
  HYD: { iata: 'HYD', name: 'Hyderabad', lat: 17.2313, lon: 78.4299 },
  CMB: { iata: 'CMB', name: 'Colombo', lat: 7.1808, lon: 79.8841 },
  // East Asia and Australia.
  KUL: { iata: 'KUL', name: 'Kuala Lumpur', lat: 2.7456, lon: 101.71 },
  SIN: { iata: 'SIN', name: 'Singapore', lat: 1.3502, lon: 103.994 },
  BKK: { iata: 'BKK', name: 'Bangkok', lat: 13.6811, lon: 100.747 },
  HKG: { iata: 'HKG', name: 'Hong Kong', lat: 22.3118, lon: 113.9149 },
  PVG: { iata: 'PVG', name: 'Shanghai', lat: 31.1434, lon: 121.805 },
  CAN: { iata: 'CAN', name: 'Guangzhou', lat: 23.3924, lon: 113.299 },
  PEK: { iata: 'PEK', name: 'Beijing', lat: 40.0773, lon: 116.5967 },
  CTU: { iata: 'CTU', name: 'Chengdu', lat: 30.5583, lon: 103.946 },
  PER: { iata: 'PER', name: 'Perth', lat: -31.9403, lon: 115.967 },
  MEL: { iata: 'MEL', name: 'Melbourne', lat: -37.6707, lon: 144.8379 },
  SYD: { iata: 'SYD', name: 'Sydney', lat: -33.9461, lon: 151.177 },
};

// The board's words for an airport, other than its name above, in the folded form key()
// makes. A city with two airports, said bare ("Paris", "London"), is the one its flights to
// Mauritius use.
const ALIASES = {
  'st denis reunion': 'RUN',
  'saint denis reunion': 'RUN',
  'st denis': 'RUN',
  'saint denis': 'RUN',
  reunion: 'RUN',
  'roland garros': 'RUN',
  'st pierre reunion': 'ZSE',
  'saint pierre reunion': 'ZSE',
  'st pierre': 'ZSE',
  'saint pierre': 'ZSE',
  pierrefonds: 'ZSE',
  'rodrigues island': 'RRG',
  'plaine corail': 'RRG',
  seychelles: 'SEZ',
  mahe: 'SEZ',
  'mahe island': 'SEZ',
  'mahe seychelles': 'SEZ',
  tananarive: 'TNR',
  'nosy be island': 'NOS',
  tamatave: 'TMM',
  dzaoudzi: 'DZA',
  comores: 'HAH',
  comoros: 'HAH',
  male: 'MLE',
  maldives: 'MLE',
  'dar es salam': 'DAR',
  paris: 'CDG',
  'paris cdg': 'CDG',
  'paris charles de gaulle': 'CDG',
  'charles de gaulle': 'CDG',
  orly: 'ORY',
  london: 'LHR',
  heathrow: 'LHR',
  'london lhr': 'LHR',
  gatwick: 'LGW',
  'london lgw': 'LGW',
  munchen: 'MUC',
  dusseldorf: 'DUS',
  wien: 'VIE',
  zurich: 'ZRH',
  geneve: 'GVA',
  roma: 'FCO',
  'rome fiumicino': 'FCO',
  milan: 'MXP',
  milano: 'MXP',
  malpensa: 'MXP',
  'amsterdam schiphol': 'AMS',
  bruxelles: 'BRU',
  marseilles: 'MRS',
  lyons: 'LYS',
  moscow: 'SVO',
  'moscow sheremetyevo': 'SVO',
  'istanbul sabiha gokcen': 'SAW',
  'sabiha gokcen': 'SAW',
  bombay: 'BOM',
  'new delhi': 'DEL',
  bengaluru: 'BLR',
  madras: 'MAA',
  'shanghai pudong': 'PVG',
  'beijing capital': 'PEK',
};

// Case, accents, punctuation and spacing folded away: "St-Denis  Réunion" is "st denis reunion".
const key = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const LOOKUP = new Map();
for (const d of Object.values(AIRPORTS)) {
  LOOKUP.set(key(d.iata), d);
  LOOKUP.set(key(d.name), d);
}
for (const [alias, iata] of Object.entries(ALIASES)) LOOKUP.set(key(alias), AIRPORTS[iata]);

// The airport a city on the board stands for, or null when it is not one we know.
export const airportFor = (city) => LOOKUP.get(key(city)) ?? null;
