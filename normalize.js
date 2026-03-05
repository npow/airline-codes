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
var fs = require('fs');

// Country name corrections: upstream value -> our preferred value
var COUNTRY_CORRECTIONS = {
  'Macao':                             'Macau',
  'Republic of Korea':                 'South Korea',
  "Democratic People's Republic of Korea": 'North Korea',
  'Russian Federation':                'Russia',
  'Syrian Arab Republic':              'Syria',
  'Hong Kong SAR of China':            'Hong Kong',
  'Canadian Territories':              'Canada',
  'Macedonia':                         'North Macedonia',
  'Myanmar':                           'Myanmar (Burma)',
  'Burma':                             'Myanmar (Burma)',
  'Congo (Kinshasa)':                  'Democratic Republic of the Congo',
  'Congo (Brazzaville)':               'Republic of the Congo',
};

var content = fs.readFileSync('airlines.dat', 'utf8');
var lines = content.split('\n');
var changed = 0;

var corrected = lines.map(function(line) {
  if (!line.trim()) return line;

  // CSV fields: id, name, alias, iata, icao, callsign, country, active
  // Country is field index 6 (0-based), wrapped in quotes in the dat file
  // Simple approach: replace exact quoted country value
  var original = line;
  Object.keys(COUNTRY_CORRECTIONS).forEach(function(from) {
    var to = COUNTRY_CORRECTIONS[from];
    // Match quoted country field followed by comma and final field
    var pattern = new RegExp('"' + from.replace(/[()]/g, '\\$&') + '"', 'g');
    line = line.replace(pattern, '"' + to + '"');
  });
  if (line !== original) changed++;
  return line;
});

fs.writeFileSync('airlines.dat', corrected.join('\n'), 'utf8');
console.log('Normalized ' + changed + ' lines in airlines.dat');
