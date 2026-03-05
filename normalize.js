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
