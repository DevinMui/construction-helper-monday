from flask import Flask, request, jsonify

from requests import post
from zillow import api as zillow_api

import json
import os

app = Flask(__name__)

SIGNING_TOKEN = "a330465c01699e22129599e12107fe38"
API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjkyMDUxNTQwLCJ1aWQiOjE0ODgwMzE4LCJpYWQiOiIyMDIwLTExLTI2VDIzOjU4OjU4LjAwMFoiLCJwZXIiOiJtZTp3cml0ZSJ9.71SM1nsCH-niBQS1wCGGsRF1URyZDj8e7kMvoFqR6zM"

MONDAY_ENDPOINT = "https://api.monday.com/v2"


@app.route("/", methods=["POST"])
def search():
    body = request.json

    # parse monday request
    values = body["payload"]["inboundFieldValues"]
    board_id = values["boardId"]
    item_id = values["itemId"]
    address = values["addressValue"]

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
        "image",
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
        if param + "Id" in values:
            columns[param] = values.get(param + "Id", None)

    # values = zillow_api.search(address)
    values = json.loads(open("./zillow/search.json", "r").read())

    # parse zillow response
    values = values["cat1"]["searchResults"]["mapResults"]
    if not len(values):
        return jsonify(res)
    values = values[0]["hdpData"]["homeInfo"]

    # build response values
    column_values = {}
    for key in columns.keys():
        column_values[columns[key]] = values[key]

    print("[column values]", json.dumps(column_values))

    headers = {"Authorization": API_TOKEN}

    # change multiple column values using GraphQL
    query = "mutation ($board_id: Int!, $item_id: Int!, $column_values: JSON!) { change_multiple_column_values (board_id: $board_id, item_id: $item_id, column_values: $column_values) { id }}"

    variables = {
        "board_id": board_id,
        "item_id": item_id,
        "column_values": json.dumps(column_values),
    }

    data = {"query": query, "variables": variables}

    post(MONDAY_ENDPOINT, json=data, headers=headers)

    return jsonify(res)
