import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

const listenToContext = (cb) => {
  monday.listen("context", (e) => {
    cb(e.data.boardId);
  });
};

// Annotations
// -----
const deleteAnnotation = async (itemId) => {
  // remove subitem form table
};
const getAnnotations = async (itemId) => {
  // Read subitems
};
const createAnnotation = async (itemId, title, description, user) => {
  // Check for subitem column
  // formats title, description, user
};

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
        let files = []
        try { 
            let e = JSON.parse(cv["value"]).files;
            files = e
        } catch (e) {}
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

const updateSTL = async () => {
  // Overwrites existing STL
  // Rerenders STL after STL uploaded
};

export {
  listenToContext,
  getSTLItems,
  deleteAnnotation,
  createAnnotation,
  getAnnotations,
  updateSTL,
};
