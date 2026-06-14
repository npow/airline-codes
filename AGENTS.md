# AGENTS.md — guidance for AI coding agents

## How data corrections work

`airlines.dat` and `airlines.json` are **generated files**. Do not edit them directly.

- `airlines.dat` is fetched weekly from [jpatokal/openflights](https://github.com/jpatokal/openflights/blob/master/data/airlines.dat).
- `airlines.json` is regenerated from `airlines.dat` by running `node convert.js`.
- `normalize.js` applies local corrections **after** every upstream fetch, before `convert.js` runs.

## How to add a correction

1. Open `normalize.js`.
2. For a country name fix, add an entry to `COUNTRY_CORRECTIONS`.
3. For any other field fix (name, IATA, ICAO, callsign, active status, etc.), add an entry to `ID_CORRECTIONS` keyed by the airline's numeric ID (as a string). Include a comment explaining the reason.
4. Regenerate both data files:
   ```
   node normalize.js   # patches airlines.dat in-place
   node convert.js     # regenerates airlines.json
   ```
5. Verify the corrected entry appears correctly in `airlines.json`.
6. Commit `normalize.js`, `airlines.dat`, and `airlines.json` together.

## Verifying issues

Before implementing a reported data correction, verify the claim against at least one authoritative source (e.g. [airhex.com](https://airhex.com), [IATA code search](https://www.iata.org/en/publications/directories/code-search/), or [avcodes.co.uk](https://www.avcodes.co.uk/airlcodesearch.asp)).

## Commit authorship

Commits should be authored as the repo owner: `Nissan Pow <nissan.pow@gmail.com>`.
