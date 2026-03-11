var csv = require('csv');
var JSONStream = require('JSONStream');
var fs = require('fs');
var _ = require('lodash');

var columns = ['id', 'name', 'alias', 'iata', 'icao', 'callsign', 'country', 'active'];

var content = fs.readFileSync('airlines.dat', 'utf8');

csv.parse(content, function(err, records) {
  if (err) throw err;

  var airlines = records.map(function(data) {
    return _.zipObject(columns, data);
  });

  // Sort active airlines first so they take precedence over inactive ones
  // when consumers look up by IATA/ICAO code
  airlines = _.sortBy(airlines, function(a) { return a.active === 'Y' ? 0 : 1; });

  var writeStream = fs.createWriteStream('airlines.json');
  var jsonStream = JSONStream.stringify();
  jsonStream.pipe(writeStream);
  airlines.forEach(function(a) { jsonStream.write(a); });
  jsonStream.end();
});
