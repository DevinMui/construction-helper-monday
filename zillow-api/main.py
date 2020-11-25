from requests import get, post

BASE_URL = "https://www.zillow.com"

# Adding headers makes Zillow think you're not a robot for a short while
headers = {
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

# Search finds properties in an area
# Search can also get information about the property without extra requests
# Walkscore and price history data needs to be found via another request
def search(addr, city):
    # uri = "/search/GetSearchPageState.htm"
    uri = '/search/GetSearchPageState.htm?searchQueryState={"pagination":{},"mapBounds":{"west":-121.58174514770508,"east":-121.42707824707031,"south":38.629879442063555,"north":38.73855285385149},"mapZoom":13,"isMapVisible":false,"filterState":{"isAllHomes":{"value":true},"sortSelection":{"value":"globalrelevanceex"}},"isListVisible":true}&wants={%22cat1%22:[%22mapResults%22]}&requestId=2'
    # TODO: figure out how to get bounds
    # More info: map bounds is required to get properties
    # Map bounds appear to be a box with lat/lng
    # regionSelection is not necessary (not sure what it's for
    # but omitting it yields more results)
    # Google Maps -> box?

    # query doesn't convert to string properly yet...
    query = {
        "searchQueryState": {
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
        },
        "wants": {"cat1": ["mapResults"]},
        "requestId": 2,
    }

    r = get(BASE_URL + uri, headers=headers)
    print(r.text)
    return r


def get_price_history(zid):
    pass


def get_walkscore(zid):
    pass


# do we even need this?
def deepdive(zid):
    pass


search("", "")
# print(search("", "").text)

