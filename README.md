# Airline Codes
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

### Fetch Airline codes

```
$ wget https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat
```

### Generate the list

Convert the list of airlines codes from csv format to JSON.

```
node convert.js
```

## Thanks

- [Andrew Kennedy](https://github.com/akenn/airport-codes)
- [Ram Nadella](https://github.com/ram-nadella/airport-codes)
- [Jani Patokallio](https://github.com/jpatokal/openflights/)
