# get item id

# if sub item exists, delete all

# mutation {
#   change_column_value(board_id: 878537780, item_id: 879664752, column_id: "subitems8", value: "{}") {
#     id
#   }
# }

# create subitem to get board
# mutation {
# 	create_subitem(parent_item_id: 879664752, item_name:"test", column_values: "{\"text\":\"hello\"}") {
#     id,
#     board {
#       id
#     }
#   }
# }

# check for existence of columns
query {
  boards (ids: 881111563) {
    columns {
      id,
      title
    }
  }
}

# add columns to board
# mutation {
#   create_column(board_id: 881111563, title: "Epoch", column_type: numbers) {
#     id
#   }
# }

# mutation {
#     create_column(board_id: 881111563, title: "Price", column_type: numbers) {
#     id
#   }
# }

# update first subitem

# create many subitems...
