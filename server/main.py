from flask import Flask, request, jsonify

from requests import post
from zillow import api as zillow_api

import json
import os

app = Flask(__name__)

SIGNING_TOKEN = "a330465c01699e22129599e12107fe38"
API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjkyMDUxNTQwLCJ1aWQiOjE0ODgwMzE4LCJpYWQiOiIyMDIwLTExLTI2VDIzOjU4OjU4LjAwMFoiLCJwZXIiOiJtZTp3cml0ZSJ9.71SM1nsCH-niBQS1wCGGsRF1URyZDj8e7kMvoFqR6zM"

MONDAY_ENDPOINT = "https://api.monday.com/v2"

HEADERS = {"Authorization": API_TOKEN}

# Zillow Integration
def price_history():
    pass


def walk_score():
    pass


@app.route("/", methods=["POST"])
def search():
    body = request.json

    # parse monday request
    payload = body["payload"]["inboundFieldValues"]
    board_id = payload["boardId"]
    item_id = payload["itemId"]
    address = payload["addressValue"]

    create_subitem(
        item_id,
    )

    # data wanted from zillow
    params = [
        "price",
        "latitude",
        "longitude",
        "dateSold",
        "bathrooms",
        "bedrooms",
        "livingArea",
        "homeType",
        "homeStatus",
        "imageLink",
        "zestimate",
        "rentZestimate",
        "taxAssessedValue",
        "lotAreaValue",
        "lotAreaUnit",
    ]

    res = {"status": "ok"}

    # get column labels
    columns = {}
    for param in params:
        if param + "Id" in payload:
            columns[param] = payload.get(param + "Id", None)

    # values = zillow_api.search(address).json()
    values = json.loads(open("./zillow/search.json", "r").read())

    # parse zillow response
    values = values["cat1"]["searchResults"]["mapResults"]
    if not len(values):
        return jsonify(res)

    values = values[0]["hdpData"]["homeInfo"]
    zpid = values["zpid"]

    # fetch price history
    # data -> property -> homeValueChartData -> points[]
    if "priceHistoryId" in payload:
        price_history = zillow_api.get_price_history(zpid).json()
    # fetch walkscore
    if "walkscoreId" in payload:
        walkscore = zillow_api.get_walkscore(zpid).json()

    # build response values
    column_values = {}
    for key in columns.keys():
        column_values[columns[key]] = values[key]

    print("[column values]", json.dumps(column_values))

    change_multiple_column_values(board_id, item_id, column_values)

    return jsonify(res)


def create_subitem(item_id: int, column_values: dict):
    query = 'mutation ($parent_item_id: Int!, $column_values: JSON!) { create_subitem($parent_item_id, item_name: "Price point", column_values: $column_values) { id }}'
    variables = {"parent_item_id": item_id, "column_values": json.dumps(column_values)}
    data = {"query": query, "variables": variables}
    return post(MONDAY_ENDPOINT, json=data, headers=HEADERS)


def change_multiple_column_values(board_id: int, item_id: int, column_values: dict):
    # change multiple column values using GraphQL
    query = "mutation ($board_id: Int!, $item_id: Int!, $column_values: JSON!) { change_multiple_column_values (board_id: $board_id, item_id: $item_id, column_values: $column_values) { id }}"

    variables = {
        "board_id": board_id,
        "item_id": item_id,
        "column_values": json.dumps(column_values),
    }

    data = {"query": query, "variables": variables}

    return post(MONDAY_ENDPOINT, json=data, headers=HEADERS)
