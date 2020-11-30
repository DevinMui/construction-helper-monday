import React from "react";
import Select from "react-select";
import upload from "./upload";
import mondaySdk from "monday-sdk-js";
import { getSTLItems as getItems } from "./Api";

const monday = mondaySdk();

function mapItemsToOptions(items) {
  /*
{
   "Task 1e":[
      {
         "name":"test.stl",
         "itemId":"881017097",
         "colId":"files",
         "assetId":144272689
      }
   ]
}
*/
  let ret = [];
  for (let key in items) {
    const e = {
      label: key,
      options: items[key].map((v) => ({
        label: v.name,
        value: JSON.stringify(v),
      })),
    };
    ret.push(e);
  }
  return ret;
}

const FileExplorer = (props) => {
  // Query items from board using ID in props
  const [items, setItems] = React.useState([]);
  const fileRef = React.createRef(null);
  const [col, setCol] = React.useState(null);

  // File object as created by input
  const [f, setF] = React.useState(false);
  // Used to clear select when file is uploaded
  const [selectFile, setSelectFile] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      // Query items
      if (props.id) {
        const d = await getItems(props.id);
        setItems(d);
      }
      // Check if they have files w/ STL extension
    })();
  }, [props.id]);

  React.useEffect(() => {
    monday.listen("settings", (e) => {
      setCol(Object.keys(e.data.file_location)[0]);
    });
  }, []);

  React.useEffect(() => {
    if (!fileRef.current) return;
    const f = fileRef.current;
    const listener = () => {
      if (f.files.length > 0) {
        let n = f.files[0].name;
        let ext = n.split(".");
        let isStl =
          ext.length >= 1 && ext[ext.length - 1].toLowerCase() === "stl";
        if (isStl) {
          setF(f.files[0]);
        } else {
          setF(null);
        }
        setSelectFile(null);
      }
    };
    fileRef.current.addEventListener("change", listener);

    return () => f.removeEventListener("change", listener);
  }, [fileRef]);

  const submit = async () => {
    let fileObj;
    let newCol = col
    try {
      if (f) {
        let query = `mutation {
            create_item (board_id: ${props.id}, item_name: "${f.name}") {
            id
            }
            }`;
        let newItem = await monday.api(query);
        newItem = newItem.data.create_item.id;
        console.log("newItem" + JSON.stringify(newItem));
        let newAsset = await upload(f, newItem, newCol);
        newAsset = newAsset.data.add_file_to_column.id;
        console.log("newASSet" + JSON.stringify(newAsset));
        query = `query {
            assets(ids: [${newAsset}]){
              url
              public_url
            }
          }`
        let url = await monday.api(query)
        url = url.data.assets[0].public_url
        fileObj = {
          name: f.name,
          itemId: newItem,
          colId: newCol,
          assetId: newAsset,
          url: url
        };
        console.log("fileObj", JSON.stringify(fileObj));
      } else {
        // file dropdown used
        let query = `
        query {
          assets(ids: [${JSON.parse(selectFile.value).assetId}]){
            url
            public_url
          }
        }
        `
        let d = await monday.api(query)
        fileObj = JSON.parse(selectFile.value);
        fileObj.url = d.data.assets[0].public_url
      }
      setCol(newCol);
      if (props.onSubmit) props.onSubmit(fileObj);
    } catch (e) {
      console.error(e);
      monday.execute("notice", {
        message: "There was an error uploading your file. Please try again.",
        type: "error",
        timeout: 10000,
      });
    }
  };

  return (
    <div className="file-explorer">
      <h1>Render your CAD building design from your Monday.com board</h1>
      <Select
        options={mapItemsToOptions(items)}
        onChange={(f) => {
          console.log(f)
          setSelectFile(f);
          setF(false);
          if (fileRef.current) {
            fileRef.current.value = "";
          }
        }}
        value={selectFile}
      />
      <h1 style={{ marginTop: "1rem" }}>...or upload a new STL file below.</h1>
      <div style={{ marginBottom: "1rem" }}>
        Make sure to choose your file upload location in 'Settings.'
      </div>
      <input type="file" ref={fileRef} />
      <button
        onClick={submit}
        className={(selectFile && col) || f ? "button-important" : "button-disabled"}
        style={{ paddingTop: 8, marginTop: 8, paddingBottom: 8, marginLeft: 0 }}
      >
        Continue
      </button>
    </div>
  );
};

// View your files within Monday
// Dropdown of files
// Upload new file button

export default FileExplorer;
