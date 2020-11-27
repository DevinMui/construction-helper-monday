from flask import Flask, request, jsonify

from requests import post

import json
import os


SIGNING_TOKEN = "a330465c01699e22129599e12107fe38"
API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjkyMDUxNTQwLCJ1aWQiOjE0ODgwMzE4LCJpYWQiOiIyMDIwLTExLTI2VDIzOjU4OjU4LjAwMFoiLCJwZXIiOiJtZTp3cml0ZSJ9.71SM1nsCH-niBQS1wCGGsRF1URyZDj8e7kMvoFqR6zM"

app = Flask(__name__)
endpoint = "https://api.monday.com/v2"


@app.route("/", methods=["POST"])
def hello():
    body = request.json

    # parse monday request
    values = body["payload"]["inboundFieldValues"]
    board_id = values["boardId"]
    item_id = values["itemId"]

    # columns
    price_id = values["priceId"]
    lat_id = values["latId"]
    lng_id = values["lngId"]

    headers = {"Authorization": API_TOKEN}

    # change multiple column values using GraphQL
    query = "mutation ($board_id: Int!, $item_id: Int!, $column_values: JSON!) { change_multiple_column_values (board_id: $board_id, item_id: $item_id, column_values: $column_values) { id }}"

    column_values = {price_id: "r", lat_id: "g", lng_id: "h"}
    variables = {
        "board_id": board_id,
        "item_id": item_id,
        "column_values": json.dumps(column_values),
    }

    data = {"query": query, "variables": variables}

    r = post(endpoint, json=data, headers=headers)

    print(r.json())

    res = {"status": "ok"}
    return jsonify(res)
