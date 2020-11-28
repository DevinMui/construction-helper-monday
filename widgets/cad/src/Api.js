import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

const listenToContext = (cb) => {
  monday.listen("context", (e) => {
    cb(e.data.boardId);
  });
};

// Files
// -----
// Store file with item
// Read file given item
// Load STL

// Annotations
// -----
// Store annotation in table
// Read associated annotation
// Delete annotations

// Monday
// -----
const getSTLItems = async (boardId) => {
  const query = `query {
        boards (ids: ${boardId}){id, name, items {
            id
            name
            column_values {
              type
              value
              id
            }
            }
        }
      }`;
  let data = await monday.api(query);
  let items = data.data.boards[0].items;
  let ret = {};
  for (let item of items) {
    for (let cv of item["column_values"]) {
      if (cv["type"] === "file") {
        let files = JSON.parse(cv["value"]).files;
        for (let file of files) {
          if (file.name.endsWith(".stl")) {
            if (!ret[item["name"]]) ret[item["name"]] = [];
            ret[item["name"]] = [
              ...ret[item["name"]],
              {
                name: file.name,
                itemId: item["id"],
                colId: cv["id"],
                assetId: file["assetId"],
              },
            ];
          }
        }
      }
    }
  }
  return ret;
  // returns a map as
  // name : [{filename, item id, col id, asset Id}]
};
// const g
// Create hidden column for annotations, files
// Read items and get files iff exists
// Write to item

// Choose board
// Choose item to attach a file (read item if it exists)
// Create new table for annotations
// Always get newest file version

export { listenToContext, getSTLItems };
