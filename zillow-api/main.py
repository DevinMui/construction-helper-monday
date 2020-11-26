from requests import get, post

import json

BASE_URL = "https://www.zillow.com"

# Adding headers makes Zillow think you're not a robot for a short while
HEADERS = {
    "authority": "www.zillow.com",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
    "accept": "*/*",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "referer": "https://www.zillow.com/sacramento-ca/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-121.58174514770508%2C%22east%22%3A-121.42707824707031%2C%22south%22%3A38.629879442063555%2C%22north%22%3A38.73855285385149%7D%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A20288%2C%22regionType%22%3A6%7D%5D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A13%7D",
    "accept-language": "en-US,en;q=0.9",
    "cookie": 'zguid=23|%24ac3ea3a6-d9ed-4795-a346-974a4d094d17; zgsession=1|3e1c22eb-e574-4358-9531-e0a1f11b6312; g_state={"i_p":1606281194042,"i_l":1}; G_ENABLED_IDPS=google; userid=X|3|6c1d3a015025d7e5%7C6%7Cmg9AzRCHaX8ImBqWyVcJGYWSCDQox2k8; loginmemento=1|1a73d28a10571a472eb14d2a85ec8514fe1300117042bab38b9c52fca08ac87d; JSESSIONID=A632A1B6D20B675039FD608D936DD956; ZILLOW_SID=1|AAAAAVVbFRIBVVsVEjKZA%2BrArqpI86irXgTqGyyOOSzzQkqoCS84dd7IYXDKDA7aopIZAtl3srIjjIiIhf1BorgIYWMP; ZILLOW_SSID=1|; search=6|1608875617733%7Cregion%3Dsacramento-ca%26rect%3D38.71%252C-120.93%252C36.71%252C-122.93%26disp%3Dmap%26mdm%3Dauto%26pt%3Dpmf%252Cpf%26fs%3D1%26fr%3D0%26rs%3D0%26ah%3D0%09%09%09%09%09%09%09%09; AWSALB=GlBlZs7AVufRb5Zw+O+zBB8OeSNWOh7QI+rcREPJKFztrw0ABd3TfVWAbLje4xfzzocViRe0hHCUQuNOC3xNGAXQfyBEOfB4OLvMGzJxM9mbpY51MeT4w+xnf1m4; AWSALBCORS=GlBlZs7AVufRb5Zw+O+zBB8OeSNWOh7QI+rcREPJKFztrw0ABd3TfVWAbLje4xfzzocViRe0hHCUQuNOC3xNGAXQfyBEOfB4OLvMGzJxM9mbpY51MeT4w+xnf1m4',
}

# TODO: Get information from Google Maps API
def get_latlng_bounds(addr, city):
    pass


# Search finds properties in an area
# Search can also get information about the property without extra requests
# Walkscore and price history data needs to be found via another request
def search(addr, city):
    uri = "/search/GetSearchPageState.htm"
    # TODO: figure out how to get bounds
    # More info: map bounds is required to get properties
    # Map bounds appear to be a box with lat/lng
    # regionSelection is not necessary (not sure what it's for
    # but omitting it yields more results)
    # Google Maps -> box?

    # json->str is necessary to get correct param format
    query = {
        "searchQueryState": json.dumps(
            {
                "pagination": {},
                "mapBounds": {
                    "west": -121.58174514770508,
                    "east": -121.42707824707031,
                    "south": 38.629879442063555,
                    "north": 38.73855285385149,
                },
                "mapZoom": 13,
                # "regionSelection": [{"regionId": 20288, "regionType": 6}],
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
    print("[SEARCH]", r.text)
    return r


def get_price_history(zid):
    uri = f"/graphql/?zpid={zid}&timePeriod=TEN_YEARS&metricType=LOCAL_HOME_VALUES&forecast=true&operationName=HomeValueChartDataQuery"

    headers = HEADERS
    headers["Content-Type"] = "text/plain"

    variables = {
        "zpid": zid,
        "timePeriod": "TEN_YEARS",
        "metricType": "LOCAL_HOME_VALUES",
        "forecast": True,
    }
    # modify zid
    query = (
        '{"query":"query HomeValueChartDataQuery($zpid: ID!, $metricType: HomeValueChartMetricType, $timePeriod: HomeValueChartTimePeriod) {\nproperty(zpid: $zpid) {\nhomeValueChartData(metricType: $metricType, timePeriod: $timePeriod) {\npoints {\nx \ny \n}\nname \n}\n}\n}\n","operationName":"HomeValueChartDataQuery","variables":'
        + json.dumps(variables)
        + ',"clientVersion":"home-details/6.0.11.0.0.hotfix-11-23-2020.d69fab8"}'
    )
    query = '{"query":"query HomeValueChartDataQuery($zpid: ID!, $metricType: HomeValueChartMetricType, $timePeriod: HomeValueChartTimePeriod) {\n  property(zpid: $zpid) {\n    homeValueChartData(metricType: $metricType, timePeriod: $timePeriod) {\n      points {\n        x\n        y\n      }\n      name\n    }\n  }\n}\n","operationName":"HomeValueChartDataQuery","variables":{"zpid":63045370,"timePeriod":"TEN_YEARS","metricType":"LOCAL_HOME_VALUES","forecast":true},"clientVersion":"home-details/6.0.11.0.0.hotfix-11-23-2020.d69fab8"}'
    print("[PRICES] headers: ", headers, "\n")
    r = post(BASE_URL + uri, headers=headers, data=query)
    print("[PRICES]", r.text)
    return r


def get_walkscore(zid):
    uri = f"/graphql/?zpid={zid}&operationName=WalkAndTransitScoreQuery"
    query = '{"query":"query WalkAndTransitScoreQuery($zpid: ID!) {\nproperty(zpid: $zpid) {\nid\nwalkScore {\nwalkscore\ndescription\nws_link\n}\ntransitScore {\ntransit_score\ndescription\nws_link\n}\n}\n}\n","operationName":"WalkAndTransitScoreQuery","variables":{"zpid":2077477020},"clientVersion":"home-details/6.0.11.0.0.hotfix-11-23-2020.d69fab8"}'
    r = post(BASE_URL + uri, headers=HEADERS, data=query)
    print("[WALKSCORE]", r.text)
    return r


# do we even need this?
def deepdive(zid):
    pass


# search("", "")
get_price_history(63045370)
