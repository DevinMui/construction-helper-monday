import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Viewer } from "@xeokit/xeokit-sdk/src/viewer/Viewer.js";
import { STLLoaderPlugin } from "@xeokit/xeokit-sdk/src/plugins/STLLoaderPlugin/STLLoaderPlugin.js";
import { AnnotationsPlugin } from "@xeokit/xeokit-sdk/src/plugins/AnnotationsPlugin/AnnotationsPlugin.js";
import Alert from "./Alert";
import trash2 from "@iconify-icons/feather/trash-2";
import { InlineIcon } from "@iconify/react";
import xIcon from "@iconify-icons/feather/x";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

function uuid() {
  return uuidv4();
}

class CAD extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.canvasRef = React.createRef();
    // Default state
    this.state = {
      alert: false,
      saving: false,
      annotation: false,
    };
  }

  componentDidMount() {
    // Query for annotations and display them
    // maybe later: Create listener for annotation
    const addAnnotation = (annotation) => {
      if (this.annotations) this.annotations.createAnnotation(annotation);
      else
        monday.execute("notice", {
          message:
            "New annotations may have been created since this page was loaded.",
          type: "info",
        });
    };

    const viewer = new Viewer({
      canvasId: "canvas",
      transparent: true,
    });
    this.stlViewer = new STLLoaderPlugin(viewer);
    this.annotations = new AnnotationsPlugin(viewer, {
      // Default options
      markerHTML: `<div class='annotation-marker' style="background: {{labelBGColor}}; border: 2px solid white; border-radius: 50%"></div>`,
      container: document.getElementById("app"),
      // Default HTML template for label
      labelHTML: `<div class='annotation-label'">
            <div class='annotation-title'>{{title}}</div>
          </div>`,

      // Default values to insert into the marker and label templates
      values: {
        markerBGColor: "transparent",
        labelBGColor: "grey",
        glyph: "🐻",
        title: "Annotation title",
        description: "Your description",
      },
    });

    (async () => {
      // Read metadata field
      const annotations = [];

      let query = `query {
        boards(ids:${this.props.boardId}) {
          items(ids:${this.props.itemId}) {
            column_values {
              id value type
            }
          }
        }
      }`;
      let cols = await monday.api(query);
      console.log("cols", cols);
      cols = cols.data.boards[0].items[0].column_values;

      let subItemId = "";
      let subtaskIds = [];
      for (const c of cols) {
        if (c.type === "subtasks" && c.value) {
          subItemId = c.id;
          console.log("c", JSON.parse(c.value));
          let v = JSON.parse(c.value);
          v = v.linkedPulseIds;
          console.log(v);
          for (const a of v) {
            subtaskIds.push(a.linkedPulseId);
          }
        }
      }
      if (!subItemId || subtaskIds.length === 0) return [];

      for (const id of subtaskIds) {
        query = `query {
          items(ids:${id}) {
            column_values {
              value
              type 
              title
            }
          }
        }`;
        let val = await monday.api(query);
        val = val.data.items[0].column_values;
        let dss = "";
        let annotation = { description: "" };
        for (const v of val) {
          if (v.type === "long-text" && v.value && v.title === "Description") {
            annotation.description = JSON.parse(v.value).text;
            dss = JSON.parse(v.value).text;
            console.log("dss", dss);
          } else if (
            v.type === "long-text" &&
            v.value &&
            v.title === "Metadata"
          ) {
            let o = JSON.parse(v.value).text;
            o = JSON.parse(o);
            let timestamp = new Date(o.timestamp);
            let author = o.author;
            console.log("dss2", dss);
            o.description = `${dss} (created by ${author} at ${timestamp.toLocaleString()})`;
            o.values.description = o.description;
            if (o.assetId === this.props.assetId) annotations.push(o);
          }
        }
      }
      return annotations;
    })()
      .then((a) => a.map(addAnnotation))
      .catch((e) => {
        console.error(e);
      });

    this.annotations.on("markerClicked", (annotation) => {
      if (this.state.annotation) {
        this.state.annotation.setLabelShown(false);
      }
      annotation.setLabelShown(true);
      this.setState({ annotation });
      viewer.cameraFlight.flyTo(annotation);
    });
    const model = this.stlViewer.load({
      id: uuid(),
      src: (this.props.link || "") + this.props.url,
    });
    model.on("loaded", () => {
      console.log("loaded");
      viewer.cameraFlight.jumpTo(model);
    });

    viewer.scene.input.on("mouseclicked", (coords) => {
      var pickRecord = viewer.scene.pick({
        canvasPos: coords,
        pickSurface: true,
      });
      if (pickRecord) {
        const id = uuid();
        console.log(pickRecord);
        this.setState({
          alert: {
            type: "add",
            annotations: this.annotations,
            info: {
              pickRecord: {
                worldPos: pickRecord.worldPos,
                worldNormal: pickRecord.worldNormal,
              },
              id,
            },
          },
        });
      }
    });
    this.viewer = viewer;
  }

  componentWillUnmount() {
    this.viewer = null;
    this.stlViewer = null;
    // Remove Monday listener... if only that existed :(
  }

  render() {
    if (this.viewer) this.viewer.scene.input.setKeyboardEnabled(false);
    return (
      <div className="App" id="app">
        <canvas ref={this.canvasRef} id="canvas" />
        {this.state.annotation && (
          <div className="annotation-grounded">
            <div
              style={{
                display: "flex",
              }}
            >
              <div className="annotation-title">
                {this.state.annotation._values.title}
              </div>
              <div style={{ position: "absolute", top: 16, right: 16 }}></div>

              <div
                style={{
                  cursor: "pointer",
                }}
              >
                {/* <InlineIcon
                  icon={trash2}
                  style={{
                    transform: "scale(1.5)",
                    marginLeft: 8,
                    marginTop: 4,
                  }}
                  onClick={() => {
                    this.setState({
                      alert: {
                        type: 1,
                        info: {
                          id: this.state.annotation.id,
                          destroy: () => {
                            this.state.annotation.destroy();
                            this.setState({ annotation: false });
                          },
                        },
                      },
                    });
                  }}
                /> */}
                <InlineIcon
                  icon={xIcon}
                  style={{
                    transform: "scale(1.5)",
                    marginLeft: 8,
                    marginTop: 4,
                  }}
                  onClick={() => this.setState({ annotation: false })}
                />
              </div>
            </div>
            <div className="annotation-description">
              {this.state.annotation._values.description}
            </div>
          </div>
        )}
        {this.state.alert && (
          <Alert
            {...this.state.alert}
            assetId={this.props.assetId}
            itemId={this.props.itemId}
            close={() => {
              this.setState({ alert: false });
            }}
          />
        )}
      </div>
    );
  }
}

export default CAD;
