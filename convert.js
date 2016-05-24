var csv = require('csv');
var JSONStream = require('JSONStream');
var fs = require('fs');
var _ = require('lodash');

var columns = ['id', 'name', 'alias', 'iata', 'icao', 'callsign', 'country', 'active'];

var readStream = fs.createReadStream('airlines.dat');
var writeStream = fs.createWriteStream('airlines.json');

var transformer = csv.transform(function(data) {
  return _.object(columns, data);
});

readStream
  .pipe(csv.parse())
  .pipe(transformer)
  .pipe(JSONStream.stringify())
  .pipe(writeStream);
