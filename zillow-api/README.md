# Zillow API

Zillow has an API but they started locking it down recently (I wonder why...). This repo exploits Zillow's _private_ API to collect data.

### Prereqs

-   Python 3 (not a racist)
-   pip

### Setup

Add an environmental variable for the Google API key for Google Maps geocoding.

```sh
export GOOGLE_API_KEY=<your api key here>
```

For easier development, put this line at the end of your virtualenv `/env/bin/activate` script (you are using virtualenv, right?).

### Methods

```py
search(addr, city)
-> returns a list of properties with property data
get_price_history(zid)
-> returns a list of prices and epoch times for graphing
get_walkscore(zid)
-> returns the property's walkscore
```

### How To

Use search to find a property. The property will have a `zid` property. Use the `zid` to find the price history and walkscore.

For example responses, look at `prices.json` and `search.json`.
