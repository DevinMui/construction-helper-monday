from requests import get, post

import googlemaps
import json
import os

BASE_URL = "https://www.zillow.com"

# Adding headers makes Zillow think you're not a robot for a short while
HEADERS = {
    "authority": "www.zillow.com",
    "origin": "https://www.zillow.com",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
    "accept": "*/*",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "referer": "https://www.zillow.com/sacramento-ca/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-121.58174514770508%2C%22east%22%3A-121.42707824707031%2C%22south%22%3A38.629879442063555%2C%22north%22%3A38.73855285385149%7D%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A20288%2C%22regionType%22%3A6%7D%5D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A13%7D",
    "accept-language": "en-US,en;q=0.9",
    "cookie": 'zguid=23|%24ac3ea3a6-d9ed-4795-a346-974a4d094d17; zgsession=1|3e1c22eb-e574-4358-9531-e0a1f11b6312; g_state={"i_p":1606281194042,"i_l":1}; G_ENABLED_IDPS=google; userid=X|3|6c1d3a015025d7e5%7C6%7Cmg9AzRCHaX8ImBqWyVcJGYWSCDQox2k8; loginmemento=1|1a73d28a10571a472eb14d2a85ec8514fe1300117042bab38b9c52fca08ac87d; JSESSIONID=A632A1B6D20B675039FD608D936DD956; ZILLOW_SID=1|AAAAAVVbFRIBVVsVEjKZA%2BrArqpI86irXgTqGyyOOSzzQkqoCS84dd7IYXDKDA7aopIZAtl3srIjjIiIhf1BorgIYWMP; ZILLOW_SSID=1|; search=6|1608875617733%7Cregion%3Dsacramento-ca%26rect%3D38.71%252C-120.93%252C36.71%252C-122.93%26disp%3Dmap%26mdm%3Dauto%26pt%3Dpmf%252Cpf%26fs%3D1%26fr%3D0%26rs%3D0%26ah%3D0%09%09%09%09%09%09%09%09; AWSALB=GlBlZs7AVufRb5Zw+O+zBB8OeSNWOh7QI+rcREPJKFztrw0ABd3TfVWAbLje4xfzzocViRe0hHCUQuNOC3xNGAXQfyBEOfB4OLvMGzJxM9mbpY51MeT4w+xnf1m4; AWSALBCORS=GlBlZs7AVufRb5Zw+O+zBB8OeSNWOh7QI+rcREPJKFztrw0ABd3TfVWAbLje4xfzzocViRe0hHCUQuNOC3xNGAXQfyBEOfB4OLvMGzJxM9mbpY51MeT4w+xnf1m4',
}

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GMAPS_CLIENT = googlemaps.Client(key=GOOGLE_API_KEY)

# Get latlng boundaries for a specific location
# Used in search(addr)
def get_latlng_bounds(addr: str):
    geocode_result = GMAPS_CLIENT.geocode(addr)
    if not len(geocode_result):
        return None

    viewport = geocode_result[0]["geometry"]["viewport"]
    northeast = viewport["northeast"]
    southwest = viewport["southwest"]
    bounds = {
        "west": southwest["lng"],
        "east": northeast["lng"],
        "south": southwest["lat"],
        "north": northeast["lat"],
    }
    return bounds


# Search finds properties in an area
# Search can also get information about the property without extra requests
def search(addr: str):
    latlng_bounds = get_latlng_bounds(addr)
    if not latlng_bounds:
        return None

    uri = "/search/GetSearchPageState.htm"

    query = {
        "searchQueryState": json.dumps(
            {
                "pagination": {},
                "mapBounds": latlng_bounds,
                "mapZoom": 11,
                "isMapVisible": True,
                "filterState": {
                    "isAllHomes": {"value": True},
                    "sortSelection": {"value": "globalrelevanceex"},
                },
                "isListVisible": True,
            }
        ),
        "wants": json.dumps({"cat1": ["mapResults"]}),
        "requestId": 2,
    }

    r = get(BASE_URL + uri, params=query, headers=HEADERS)
    return r


# Get pricing history
# Returns an array of x and y values
# where x represents time since Unix epoch
# and y represents money in USD (different for countries?)
def get_price_history(zid: int):
    uri = f"/graphql/?zpid={zid}&timePeriod=TEN_YEARS&metricType=LOCAL_HOME_VALUES&forecast=true&operationName=HomeValueChartDataQuery"

    headers = HEADERS
    headers["Content-Type"] = "text/plain"

    variables = {
        "zpid": zid,
        "timePeriod": "TEN_YEARS",
        "metricType": "LOCAL_HOME_VALUES",
        "forecast": True,
    }

    query = (
        '{"query":"query HomeValueChartDataQuery($zpid: ID!, $metricType: HomeValueChartMetricType, $timePeriod: HomeValueChartTimePeriod) {\\nproperty(zpid: $zpid) {\\nhomeValueChartData(metricType: $metricType, timePeriod: $timePeriod) {\\npoints {\\nx\\ny\\n}\\nname\\n}\\n}\\n}\\n","operationName":"HomeValueChartDataQuery","variables":'
        + json.dumps(variables)
        + ',"clientVersion":"home-details/6.0.11.0.0.hotfix-11-23-2020.d69fab8"}'
    )

    r = post(BASE_URL + uri, headers=headers, data=query)
    return r


# Get some interesting metadata
# like transit information + walking info
def get_walkscore(zid: int):
    uri = f"/graphql/?zpid={zid}&operationName=WalkAndTransitScoreQuery"

    headers = HEADERS
    headers["Content-Type"] = "text/plain"

    variables = {
        "zpid": zid,
    }

    query = (
        '{"query":"query WalkAndTransitScoreQuery($zpid: ID!) {\\nproperty(zpid: $zpid) {\\nid\\nwalkScore {\\nwalkscore\\ndescription\\nws_link\\n}\\ntransitScore {\\ntransit_score\\ndescription\\nws_link\\n}\\n}\\n}\\n","operationName":"WalkAndTransitScoreQuery","variables":'
        + json.dumps(variables)
        + ',"clientVersion":"home-details/6.0.11.0.0.hotfix-11-23-2020.d69fab8"}'
    )

    r = post(BASE_URL + uri, headers=headers, data=query)
    return r


# do we even need this?
def deepdive(zid: int):
    pass


if __name__ == "__main__":
    print("~~~Testing~~~")

    place = "San Francisco, California"
    print("[get_latlng_bounds]", "Geocoding", place)
    bounds = get_latlng_bounds(place)
    print(json.dumps(bounds))
    print("\n")

    place = "100 Silver Ave, San Francisco, California"
    print("[search]", "Finding places in", place)
    search_results = search(place)
    print(search_results.text)
    print("\n")

    # some arbitrary place in Sacramento
    zid = 63045370

    print("[get_price_history]", "Getting the pricing history of", zid)
    price_history_request = get_price_history(zid)
    print(price_history_request.text)
    print("\n")

    print("[get_walkscore]", "Getting the walkscore of", zid)
    walkscore_request = get_walkscore(zid)
    print(walkscore_request.text)
    print("\n")

    print("~~~Testing Concluded~~~")
