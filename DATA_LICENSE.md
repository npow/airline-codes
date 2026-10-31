# Airline data license and attribution

The airline database in `airlines.dat` and its generated representation in
`airlines.json` are derived from the OpenFlights Airline Database.

Contains information from OpenFlights, which is made available here under the
[Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/).

- Source: [OpenFlights airline data](https://openflights.org/data.php#airline).
- Snapshot: [jpatokal/openflights airlines.dat](https://github.com/jpatokal/openflights/blob/master/data/airlines.dat).
- Upstream licensing: [OpenFlights data license](https://openflights.org/data.php#license).

This package applies local corrections and additions in `normalize.js` and
converts the database to JSON with `convert.js`. The modified database is made
available under ODbL 1.0. The package's ISC software license does not replace
the database license.

OpenFlights also notes that airline and plane data derived from Wikipedia may
be subject to the GNU Free Documentation License; see the upstream licensing
page for details.
