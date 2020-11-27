import React from "react";
import "@material/react-text-field/dist/text-field.css";
import { GithubPicker } from "react-color";

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

  const action = () => {
    console.log("[]prop type]", props.type);

    if (props.type === "add") {
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
      props.info.destroy()
    }
    props.close();
  };
  console.log(props);
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
                display: 'flex',
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
