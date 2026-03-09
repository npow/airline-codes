# Airline Codes

[![Docs](https://img.shields.io/badge/docs-mintlify-18a34a?style=flat-square)](https://mintlify.com/npow/airline-codes)

> Airline codes (IATA) and information pulled from OpenFlights.org

## Install

```
npm install airline-codes
```

## Usage

The list of airline codes is wrapped in a Backbone Collection, so have access to all normal collection methods like `findWhere`, `at`, and `sort`.

```javascript
var airlines = require('airline-codes');

console.log(airlines.findWhere({ iata: 'WS' }).get('name'));
//=> Westjet
```

If you'd like only the JSON list of airline codes, you can use either the Backbone Collection's `toJSON` method or import the json list directly:

```javascript
require('airline-codes').toJSON();
require('airline-codes/airlines.json');
```

## Update the list of Airline Codes

Data is synced automatically every week from [jpatokal/openflights](https://github.com/jpatokal/openflights). To update manually:

```
$ wget https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat
$ node normalize.js   # apply local corrections (country names, etc.)
$ node convert.js     # regenerate airlines.json from airlines.dat
```

### Adding corrections

Upstream data uses different conventions for some country names and contains occasional data quality issues. `normalize.js` maintains a `COUNTRY_CORRECTIONS` map that is applied automatically after every upstream fetch. To add a new correction, edit the map in `normalize.js`:

```javascript
var COUNTRY_CORRECTIONS = {
  'Macao': 'Macau',
  'Republic of Korea': 'South Korea',
  // add new entries here ...
};
```

After editing, re-run the pipeline above to apply the change.

## Thanks

- [Andrew Kennedy](https://github.com/akenn/airport-codes)
- [Ram Nadella](https://github.com/ram-nadella/airport-codes)
- [Jani Patokallio](https://github.com/jpatokal/openflights/)
