from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests
from requests import post
from zillow import api as zillow_api

import json
import os
import traceback

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

SIGNING_TOKEN = "a330465c01699e22129599e12107fe38"
API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjkyMDUxNTQwLCJ1aWQiOjE0ODgwMzE4LCJpYWQiOiIyMDIwLTExLTI2VDIzOjU4OjU4LjAwMFoiLCJwZXIiOiJtZTp3cml0ZSJ9.71SM1nsCH-niBQS1wCGGsRF1URyZDj8e7kMvoFqR6zM"

MONDAY_ENDPOINT = "https://api.monday.com/v2"

HEADERS = {"Authorization": API_TOKEN}


@app.route("/cors", methods=["GET"])
@cross_origin()
def cors_endpoint():
    URL = request.query_string
    r = requests.get(URL)
    blob = r.content
    # Send blob back with CORS header

    return (blob, r.status_code, r.headers.items())


# Zillow Integration
def price_history():
    pass


def walk_score():
    pass


@app.route("/search-dump", methods=["POSt"])
def all_search():
    res = {"status": "ok"}
    try:
        body = request.json

        # parse monday request
        payload = body["payload"]["inboundFieldValues"]
        board_id = payload["boardId"]
        # target group_id to put data in
        group_id = payload["groupId"]
        address = payload["addressValue"]

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

        # get column labels
        columns = {}
        for param in params:
            if param + "Id" in payload:
                columns[param] = payload.get(param + "Id", None)

        values = zillow_api.search(address).json()
        # values = json.loads(open("./zillow/search.json", "r").read())

        # parse zillow response
        values = values["cat1"]["searchResults"]["mapResults"]
        if not len(values):
            return jsonify(res)

        # avoid monday complexity limit
        limit = 30
        for i, value in enumerate(values):
            if i > limit:
                break
            item_name = value.get("detailUrl", "Property")
            value = value["hdpData"]["homeInfo"]
            zpid = value["zpid"]

            # build response values
            column_values = {}
            for key in columns.keys():
                val = value.get(key, None)
                if val:
                    column_values[columns[key]] = val

            create_item(board_id, group_id, item_name, column_values)

    except Exception as e:
        print("[EXCEPTION]")
        traceback.print_exc()

    return jsonify(res)


@app.route("/", methods=["POST"])
def single_search():
    res = {"status": "ok"}
    try:
        body = request.json

        # parse monday request
        payload = body["payload"]["inboundFieldValues"]
        board_id = payload["boardId"]
        item_id = payload["itemId"]
        address = payload["addressValue"]

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



        # get column labels
        columns = {}
        for param in params:
            if param + "Id" in payload:
                columns[param] = payload.get(param + "Id", None)

        values = zillow_api.search(address).json()
        # values = json.loads(open("./zillow/search.json", "r").read())

        # parse zillow response
        values = values["cat1"]["searchResults"]["mapResults"]
        if not len(values):
            return jsonify(res)

        values = values[0]["hdpData"]["homeInfo"]
        zpid = values["zpid"]

        # build response values
        column_values = {}
        for key in columns.keys():
            val = values.get(key, None)
            if val:
                column_values[columns[key]] = val

        # fetch walkscore
        if "walkscoreId" in payload:
            walkscore = zillow_api.get_walkscore(zpid).json()
            # walkscore = json.loads(open("./zillow/walk.json", "r").read())
            walkscore = walkscore["data"]["property"]["transitScore"]["transit_score"]
            column_values[payload["walkscoreId"]] = walkscore

        change_multiple_column_values(board_id, item_id, column_values)

    except Exception as e:
        print("[EXCEPTION]")
        traceback.print_exc()

    return jsonify(res)


@app.route("/price-history", methods=["POST"])
def fetch_price_history():
    res = {"status": "ok"}
    try:
        body = request.json

        # parse monday request
        payload = body["payload"]["inboundFieldValues"]
        board_id = payload["boardId"]
        item_id = payload["itemId"]
        address = payload["addressValue"]


        values = zillow_api.search(address).json()
        # values = json.loads(open("./zillow/search.json", "r").read())

        # parse zillow response
        values = values["cat1"]["searchResults"]["mapResults"]
        if not len(values):
            return jsonify(res)

        values = values[0]["hdpData"]["homeInfo"]
        zpid = values["zpid"]

        fetch_price_history_to_monday(board_id, item_id, zpid)
    except Exception as e:
        print("[EXCEPTION]", e)
    return jsonify(res)


def fetch_price_history_to_monday(board_id: int, item_id: int, zid: int):
    # price_data = json.loads(open("./zillow/prices.json", "r").read())
    # price_data = price_data["data"]["property"]["homeValueChartData"]
    price_data = zillow_api.get_price_history(zid).json()["data"]["property"][
        "homeValueChartData"
    ]
    price_history = price_data[0]["points"]
    sell_history = price_data[1]["points"]
    # get column id of sub item
    subitem_column_id = None
    for column in get_boards(board_id)[0]["columns"]:
        if column["type"] == "subtasks":
            subitem_column_id = column["id"]
            break
    if not subitem_column_id:
        return None

    # delete all
    change_column_value(board_id, item_id, subitem_column_id, "{}")
    # create subitem (dummy values)
    subitem = create_subitem(item_id, {"data": "data"})
    subitem_id = int(subitem["id"])
    subitem_board_id = int(subitem["board"]["id"])
    labels = ["Epoch", "Price"]
    # build column ids
    columns = {}
    for column in get_boards(subitem_board_id)[0]["columns"]:
        for label in labels:
            if label in columns:
                continue
            if column["title"] == label:
                columns[label] = column["id"]


    # create necessary columns
    for label in labels:
        if label not in columns:
            column_id = create_column(subitem_board_id, label)["id"]
            columns[label] = column_id

    # add subitems
    num_data_pts = 15 * 4
    for i, price in enumerate(price_history):
        if i < len(price_history) - num_data_pts:
            continue
        # get month by month data rather than weekly
        if i % 4 == 0:
            continue
        column_values = {
            columns[labels[0]]: price["x"],
            columns[labels[1]]: price["y"],
        }
        if not i:
            print("something could go wrong here?", subitem_id)
            change_multiple_column_values(subitem_board_id, subitem_id, column_values)
        else:
            create_subitem(item_id, column_values)


def get_boards(board_id: int):
    query = "query ($board_id: [Int]) { boards(ids: $board_id) { columns { id, title, type } } }"
    variables = {"board_id": board_id}
    data = {"query": query, "variables": variables}
    r = post(MONDAY_ENDPOINT, json=data, headers=HEADERS)
    res = r.json()
    return res["data"]["boards"]


# figure out enums laterrr
def create_column(board_id: int, title: str, column_type: str = None):
    query = "mutation ($board_id: Int!, $title: String!) { create_column(board_id: $board_id, title: $title, column_type: numbers) { id } }"
    variables = {"board_id": board_id, "title": title}
    data = {"query": query, "variables": variables}
    r = post(MONDAY_ENDPOINT, json=data, headers=HEADERS)
    res = r.json()
    return res["data"]["create_column"]


def change_column_value(board_id: int, item_id: int, column_id: str, value: str):
    query = "mutation ($board_id: Int!, $item_id: Int!, $column_id: String!, $value: JSON!) { change_column_value (board_id: $board_id, item_id: $item_id, column_id: $column_id, value: $value) { id }}"
    variables = {
        "board_id": board_id,
        "item_id": item_id,
        "column_id": column_id,
        "value": value,
    }
    data = {"query": query, "variables": variables}
    r = post(MONDAY_ENDPOINT, json=data, headers=HEADERS)
    res = r.json()
    return res["data"]["change_column_value"]


def create_item(board_id: int, group_id: str, item_name: str, column_values: dict):
    query = "mutation ($board_id: Int!, $group_id: String!, $item_name: String!, $column_values: JSON!) { create_item(board_id: $board_id, group_id: $group_id, item_name: $item_name, column_values: $column_values) { id } }"
    variables = {
        "board_id": board_id,
        "group_id": group_id,
        "item_name": item_name,
        "column_values": json.dumps(column_values),
    }
    data = {"query": query, "variables": variables}
    r = post(MONDAY_ENDPOINT, json=data, headers=HEADERS)
    res = r.json()
    return res["data"]["create_item"]


def create_subitem(item_id: int, column_values: dict):
    query = 'mutation ($parent_item_id: Int!, $column_values: JSON!) { create_subitem(parent_item_id: $parent_item_id, item_name: "Price point", column_values: $column_values) { id, board { id } }}'
    variables = {"parent_item_id": item_id, "column_values": json.dumps(column_values)}
    data = {"query": query, "variables": variables}
    r = post(MONDAY_ENDPOINT, json=data, headers=HEADERS)
    res = r.json()
    return res["data"]["create_subitem"]


def change_multiple_column_values(board_id: int, item_id: int, column_values: dict):
    # change multiple column values using GraphQL
    query = "mutation ($board_id: Int!, $item_id: Int!, $column_values: JSON!) { change_multiple_column_values (board_id: $board_id, item_id: $item_id, column_values: $column_values) { id }}"

    variables = {
        "board_id": board_id,
        "item_id": item_id,
        "column_values": json.dumps(column_values),
    }

    data = {"query": query, "variables": variables}

    r = post(MONDAY_ENDPOINT, json=data, headers=HEADERS)
    res = r.json()
    print(res)
    return res["data"]["change_multiple_column_values"]
