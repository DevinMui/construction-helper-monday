import React from "react";
import Select from "react-select";
import upload from './upload'
import { getSTLItems as getItems } from "./Api";

function mapItemsToOptions(items) {
  console.log(items);
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
  console.log(ret);
  return ret;
}

const FileExplorer = (props) => {
  // Query items from board using ID in props
  const [items, setItems] = React.useState([]);
  const [fileSelected, setFileSelected] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [f, setF] = React.useState(null);
  const fileRef = React.createRef(null);

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
    if (!fileRef.current) return;
    const f = fileRef.current;
    const listener = () => {
      if (f.files.length > 0) {
        let n = f.files[0].name;
        let ext = n.split(".");
        setFileSelected(
          ext.length >= 1 && ext[ext.length - 1].toLowerCase() === "stl"
        );
        setFile(null);
        setF(f.files[0])
      }
    };
    fileRef.current.addEventListener("change", listener);

    return () => f.removeEventListener("change", listener);
  }, [fileRef]);

  const submit = () => {
    upload(f).then(e => console.log(e))
  }

  return (
    <div className="file-explorer">
      <h1>Render CAD building design from your Monday.com board</h1>
      <Select
        options={mapItemsToOptions(items)}
        onChange={(f) => {
          setFile(f);
          setFileSelected(true);
        }}
        value={file}
      />
      <h1 style={{ marginTop: "1rem" }}>...or upload a new STL file below.</h1>
      <input type="file" ref={fileRef} />
      <button
        onClick={submit}
        className={fileSelected ? "button-important" : "button-disabled"}
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
