import React from "react";
import "@material/react-text-field/dist/text-field.css";
import { GithubPicker } from "react-color";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

/*
    this.annotations.createAnnotation({
        id,
        pickRecord: pickRecord,
        occludable: true,
        values: {
        glyph: "🐻",
        title: "My annotation " + u,
        description: "My description " + u,
        },
    });
*/

const colors = [
  "#00C875",
  "#4ECCC6",
  "#7E3B8A",
  "#333333",
  "#7F5347",
  "#FAA1F1",
  "#66CCFF",
  "#401694",
  "#784BD1",
  "#FFCB00",
  "#5559DF",
  "#579BFC",
  "#FDAB3D",
  "#FFADAD",
  "#68A1BD",
  "#225091",
  "#FF7575",
  "#9AADBD",
];

const Alert = (props) => {
  const [colorOpen, setColorOpen] = React.useState(false);
  const [color, setColor] = React.useState("grey");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const action = async (e) => {
    e.preventDefault();
    try {
      let me = await monday.api(`query { me { name } }`);
      me = me.data.me.name;
      if (props.type === "add") {
        let itemsCol;
        let metadataId = "metadata";
        let descriptionId = "description";

        let query = `query {
        items(ids: [${props.itemId}]){
          column_values{
            type
            value
            id 
          }
        }
      }`;
        let q = await monday.api(query);
        q = q.data.items[0].column_values;
        for (let v of q) {
          if (v["type"] === "subtasks") {
            itemsCol = v["id"];
          }
        }
        if (!itemsCol) {
          monday.execute("notice", {
            message: `Your board doesn't have a subitems column for annotations yet. Create one and try again.`,
            type: "error",
            timeout: 10000,
          });
          return;
        }
        console.log(itemsCol);
        query = `query {
          boards {
            items(ids: ${props.itemId}) {
              column_values(ids:"${itemsCol}") {
                id 
                value
                type
              }
            }
          }
        }
        `;
        q = await monday.api(query);
        q = q.data.boards;
        console.log('q', q)
        let linkPulse = "";
        for (let item of q) {
          if (item.items.length > 0) {
            const v = item.items[0].column_values[0].value;
            console.log(v);
            linkPulse = JSON.parse(v).linkedPulseIds[0].linkedPulseId;
          }
        }

        query = `query {
          items(ids:${linkPulse}) {
            id
            column_values {
              id
              type
              title
            }
          }
        }`;
        q = await monday.api(query);
        q = q.data.items[0].column_values;
        console.log(q)
        let descriptionExists = false;
        let metaExists = false;
        for (let c of q) {
          if (c.title === "Description" && c.type === "long-text") {
            descriptionExists = true
            descriptionId = c.id;
          }
          if (c.title === "Metadata" && c.type === "long-text") {
            metaExists = true
            metadataId = c.id;
          }
        }

        if (!descriptionExists) {
          // Create description column here
          monday.execute("notice", {
            message: `Could not find a subitem column called "Description" which takes long text. Create one and try again `,
            type: "error",
            timeout: 10000,
          });

          return;
        }
        if (!metaExists) {
          // Create meta column here
          monday.execute("notice", {
            message: `Could not find a subitem column called "Metadata" which takes long text. Create one and try again `,
            type: "error",
            timeout: 10000,
          });

          return;
        }

        const vals = {};
        vals[descriptionId] = description;
        vals[metadataId] = JSON.stringify({
          ...props.info,
          timestamp: Date.now(),
          assetID: props.assetID,
          author: me,
          occludable: true,
          values: {
            glyph: "🐻",
            title: title,
            description: description,
            labelBGColor: color,
          },
        });

        query = `mutation {
        create_subitem(parent_item_id: ${
          props.itemId
        }, item_name:${JSON.stringify(title)}, column_values: ${JSON.stringify(
          JSON.stringify(vals)
        )}) {
          id,
          board {
            id
          }
        }
      }`;
        console.log(query);
        await monday.api(query);
        props.annotations.createAnnotation({
          ...props.info,
          occludable: true,
          values: {
            glyph: "🐻",
            title: title,
            description: description,
            labelBGColor: color,
          },
        });
      } else {
        // delete
        props.info.destroy();
      }
      props.close();
    } catch (e) {
      const message = props.type === 'add' ? 'An error occurred while adding your annotation. Please try again.':'An error occurred while deleting your annotation. Please try again.'
      monday.execute("notice", {
        message,
        type: "error",
        timeout: 10000,
      });
      console.error(e);
    }
  };
  return (
    <div className="alert-container" onClick={props.close}>
      <form
        className="alert"
        onClick={(e) => e.stopPropagation()}
        onSubmit={action}
      >
        <h1>{props.type === "add" ? "Add Annotation" : "Delete Annotation"}</h1>
        {props.type !== "add" && (
          <p>Are you sure you want to delete this annotation?</p>
        )}
        {props.type === "add" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="button-row">
              <div
                onClick={() => setColorOpen(true)}
                style={{
                  backgroundColor: color,
                  borderRadius: "50%",
                  width: 16,
                  marginRight: 8,
                  height: 16,
                  transform: "translateY(-4px)",
                }}
              ></div>
              <input
                type="text"
                placeholder="Title"
                onClick={() => {
                  setColorOpen(false);
                }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required={true}
                style={{ flexGrow: 1 }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                marginTop: 32,
                display: colorOpen ? "block" : "none",
              }}
            >
              <GithubPicker
                colors={colors}
                onChangeComplete={(c, _) => {
                  setColorOpen(false);
                  setColor(c.hex);
                }}
              />
            </div>

            <textarea
              placeholder="Description"
              onClick={() => {
                setColorOpen(false);
              }}
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            />
          </div>
        )}
        <div className="button-row">
          <div className="button" onClick={props.close}>
            Cancel
          </div>
          <button type="submit" className="button-important">
            OK
          </button>
        </div>
      </form>
    </div>
  );
};

// title
// colors
// description + - User name

export default Alert;
