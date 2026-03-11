/**
 * normalize.js
 *
 * Applies corrections to airlines.dat after fetching upstream OpenFlights data.
 * Upstream (jpatokal/openflights) uses different country name conventions and
 * has some data quality issues that this project has historically corrected.
 *
 * Run: node normalize.js
 *   Reads airlines.dat, applies corrections, writes airlines.dat in-place.
 */
var csv = require('csv');
var fs = require('fs');

// Country name corrections: upstream value -> our preferred value
var COUNTRY_CORRECTIONS = {
  'Macao':                                   'Macau',
  'Republic of Korea':                       'South Korea',
  "Democratic People's Republic of Korea":   'North Korea',
  'Russian Federation':                      'Russia',
  'Syrian Arab Republic':                    'Syria',
  'Hong Kong SAR of China':                  'Hong Kong',
  'Canadian Territories':                    'Canada',
  'Macedonia':                               'North Macedonia',
  'Myanmar':                                 'Myanmar (Burma)',
  'Burma':                                   'Myanmar (Burma)',
  'Congo (Kinshasa)':                        'Democratic Republic of the Congo',
  'Congo (Brazzaville)':                     'Republic of the Congo',
};

// Per-ID field corrections for data corruption and specific known fixes.
// Keys are airline IDs (as strings). Values are objects with field overrides.
// Fields: name, alias, iata, icao, callsign, country, active
var ID_CORRECTIONS = {
  // Alaska Airlines: upstream has country="ALASKA" (callsign leaked into country field)
  '439':   { country: 'United States' },
  // Dragonair: upstream has country="DRAGON" (callsign leaked into country field)
  '2056':  { country: 'Hong Kong' },
  // Defunct/duplicate airlines incorrectly marked active upstream:
  '2988':  { active: 'N' },  // Japan Airlines Domestic (dup of JAL, same ICAO JAL)
  '3384':  { active: 'N' },  // Malmo Aviation (defunct)
  '3386':  { active: 'N' },  // Malmö Aviation (dup of above, same ICAO SCW)
  '4264':  { active: 'N' },  // Royal Nepal Airlines (defunct, replaced by Nepal Airlines)
  '4560':  { active: 'N' },  // Swissair (defunct, dup of Swiss Intl, same ICAO SWR)
  // IATA code collision fixes - defunct airlines sharing code with active ones:
  '595':   { active: 'N' },  // Atlant-Soyuz Airlines (3G) - ceased 2011
  '19862': { active: 'N' },  // AsiaCargo Express (3G) - rebranded/ceased 2020
  '2051':  { active: 'N' },  // DonbassAero (5D) - ceased 2013
  '3432':  { active: 'N' },  // Maxair (8M) - ceased 2005
  '3570':  { active: 'N' },  // Myanmar Airways International (8M) - duplicate entry (keep id 19846)
  '1436':  { active: 'N' },  // Bellview Airlines (B3) - ceased 2009
  '543':   { active: 'N' },  // Air Bangladesh (B9) - ceased 2005
  '1411':  { active: 'N' },  // British International Helicopters (BS) - ceased 2012
  '3363':  { active: 'N' },  // Macair Airlines (CC) - ceased 2009
  '1881':  { active: 'N' },  // Continental Airlines (CO) - merged into United 2012
  '1883':  { active: 'N' },  // Continental Express (CO) - defunct
  '1615':  { active: 'N' },  // Canadian Airlines (CP) - bankrupt 2001
  '1860':  { active: 'N' },  // Compass Airlines (CP) - ceased 2020
  '1790':  { active: 'N' },  // City Connexion Airlines (G3) - ceased ~2000
  '116':   { active: 'N' },  // Air Italy (I9) - liquidated 2020
  '2855':  { active: 'N' },  // Indigo/IBU (I9) - ceased 2004
  '4188':  { active: 'N' },  // Republic Express Airlines (RH) - ceased 2010
  '4936':  { active: 'N' },  // Tiger Airways (TR) - merged into Scoot 2017
  '2439':  { active: 'N' },  // Formosa Airlines (VY) - merged 1999
  '5424':  { active: 'N' },  // Western Airlines (WA) - merged into Delta 1987
  '575':   { active: 'N' },  // Air Exel (XT) - ceased 2005
  '792':   { active: 'N' },  // Access Air (ZA) - ceased 2001
  '2883':  { active: 'N' },  // Interavia Airlines (ZA) - ceased 2008
  '220':   { active: 'N' },  // Air Bourbon (ZB) - ceased 2004
  '3532':  { active: 'N' },  // Monarch Airlines (ZB) - collapsed 2017
  '3743':  { active: 'N' },  // Novair (1I) - bankrupt 2023
  '3788':  { active: 'N' },  // Onur Air (8Q) - bankrupt 2021
  '5559':  { active: 'N' },  // Maldivian Air Taxi (8Q) - merged into Trans Maldivian 2013
  '1879':  { active: 'N' },  // Contact Air (C3) - ceased 2012
  '12997': { active: 'N' },  // QatXpress (C3) - defunct
  '19861': { active: 'N' },  // Regent Airways (RX) - suspended 2020
  '19676': { active: 'N' },  // Rainbow Air Polynesia (RX) - defunct
  '4981':  { active: 'N' },  // Trans Mediterranean Airlines (TL) - ceased 2014
  '11850': { active: 'N' },  // Skyjet Airlines (UQ) - ceased 2009
  // Wrong IATA codes in upstream data:
  '4374':  { iata: 'GQ' },  // Sky Express Greece - correct code is GQ not G3
  '19849': { iata: 'GX' },  // Guangxi Beibu Gulf Airlines - correct code is GX not UQ
};

var columns = ['id', 'name', 'alias', 'iata', 'icao', 'callsign', 'country', 'active'];

var content = fs.readFileSync('airlines.dat', 'utf8');
var rows = [];
var changed = 0;

csv.parse(content, function(err, records) {
  if (err) throw err;

  records.forEach(function(row) {
    var id = row[0];
    var original = row.slice();

    // Strip leading spaces from callsign (upstream data corruption)
    if (row[5] && row[5][0] === ' ') {
      row[5] = row[5].trim();
    }

    // Apply country name corrections
    var countryIdx = 6;
    if (COUNTRY_CORRECTIONS[row[countryIdx]]) {
      row[countryIdx] = COUNTRY_CORRECTIONS[row[countryIdx]];
    }

    // Apply per-ID corrections
    if (ID_CORRECTIONS[id]) {
      var fixes = ID_CORRECTIONS[id];
      Object.keys(fixes).forEach(function(field) {
        var idx = columns.indexOf(field);
        if (idx !== -1) row[idx] = fixes[field];
      });
    }

    if (row.join(',') !== original.join(',')) changed++;
    rows.push(row);
  });

  // Re-serialize as CSV matching the original dat format
  csv.stringify(rows, function(err, output) {
    if (err) throw err;
    fs.writeFileSync('airlines.dat', output, 'utf8');
    console.log('Normalized ' + changed + ' rows in airlines.dat');
  });
});
