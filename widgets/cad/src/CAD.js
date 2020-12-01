import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Viewer } from "@xeokit/xeokit-sdk/src/viewer/Viewer.js";
import { STLLoaderPlugin } from "@xeokit/xeokit-sdk/src/plugins/STLLoaderPlugin/STLLoaderPlugin.js";
import { AnnotationsPlugin } from "@xeokit/xeokit-sdk/src/plugins/AnnotationsPlugin/AnnotationsPlugin.js";
import Alert from "./Alert";
import Icon, { InlineIcon } from "@iconify/react";
import xIcon from "@iconify-icons/feather/x";
import uploadIcon from "@iconify-icons/feather/upload";
import mondaySdk from "monday-sdk-js";
import ReactTooltip from "react-tooltip";
import Calculator from "./Calculator";
import upload from "./upload";
const monday = mondaySdk();

function uuid() {
  return uuidv4();
}

class CAD extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.canvasRef = React.createRef();
    this.fileRef = React.createRef();
    // Default state
    this.state = {
      ...props,
      alert: false,
      saving: false,
      annotation: false,
    };
  }

  loadAnnotations = async (boardId, itemId, assetId) => {
    // Read metadata field
    const annotations = [];
    if (this.annotations) {
      this.annotations.clear();
    }
    let query = `query {
      boards(ids:${boardId}) {
        items(ids:${itemId}) {
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
          name
          column_values {
            value
            type 
            title
          }
        }
      }`;
      let val = await monday.api(query);
      const n = val.data.items[0].name;
      val = val.data.items[0].column_values;
      let dss = "";
      let annotation = { description: "" };
      for (const v of val) {
        if (v.type === "long-text" && v.value && v.title === "Description") {
          annotation.description = JSON.parse(v.value).text;
          dss = JSON.parse(v.value).text;
        } else if (
          v.type === "long-text" &&
          v.value &&
          v.title === "Metadata"
        ) {
          let o = JSON.parse(v.value).text;
          o = JSON.parse(o);
          let timestamp = new Date(o.timestamp);
          let author = o.author;
          o.description = `${dss} (created by ${author} at ${timestamp.toLocaleString()})`;
          o.values.description = o.description;
          o.values.title = n;
          if (o.assetId === assetId || o.assetId === "all")
            annotations.push(o);
        }
      }
    }
    return annotations;
  };

  fileListener = async () => {
    if (!this.fileRef.current) return;
    const f = this.fileRef.current;
    if (f.files.length > 0) {
      let n = f.files[0].name;
      let ext = n.split(".");
      let isStl =
        ext.length >= 1 && ext[ext.length - 1].toLowerCase() === "stl";
      if (isStl) {
        // upload file
        let newAsset = await upload(
          f.files[0],
          this.state.itemId,
          this.state.colId,
          this.props.token
        );
        newAsset = newAsset.data.add_file_to_column.id;
        console.log("newASSet" + JSON.stringify(newAsset));
        const query = `query {
          assets(ids: [${newAsset}]){
            url
            public_url

          }
        }`;
        let url = await monday.api(query);
        console.log(url.data);
        url = url.data.assets[0].public_url;
        this.setState({url})
        // load new stl
        const model = this.stlViewer.load({
          id: uuid(),
          src: (this.state.link || "") + url,
        });
        model.on("loaded", () => {
          console.log("loaded");
          if (this.viewer) this.viewer.cameraFlight.jumpTo(model);
        });

        if (this.annotations) this.loadAnnotations(this.state.boardId, this.state.itemId, newAsset);
      } else {
        monday.execute("notice", {
          message: `Please upload a STL file.`,
          type: "error",
          timeout: 10000,
        });
      }
    }
  };

  addAnnotation = (annotation) => {
    try {
      this.annotations.createAnnotation(annotation);
    } catch(e) {
      monday.execute("notice", {
        message:
          "New annotations may have been created since this page was loaded.",
        type: "info",
      });
      console.error(e)
    }
  };

  componentDidMount() {
    // Query for annotations and display them
    // maybe later: Create listener for annotation

    if (this.fileRef.current)
      this.fileRef.current.addEventListener("change", this.fileListener);

    const viewer = new Viewer({
      canvasId: "canvas",
      transparent: true,
    });
    this.stlViewer = new STLLoaderPlugin(viewer);
    this.annotations = new AnnotationsPlugin(viewer, {
      // Default options
      markerHTML: `<div class='annotation-marker' data- style="background: {{labelBGColor}}; border: 2px solid white; border-radius: 50%"></div>`,
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

    this.loadAnnotations(this.state.boardId, this.state.itemId, this.state.assetId)
      .then((a) => a.map(this.addAnnotation))
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
      // TODO: load other things
      id: uuid(),
      src: (this.state.link || "") + this.state.url,
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
    if (this.fileRef.current)
      this.fileRef.current.removeEventListener("change", this.fileListener);
    // Remove Monday listener... if only that existed :(
  }

  render() {
    return (
      <div className="App" id="app">
        <Calculator url={(this.state.link || "") + this.state.url} />
        <canvas ref={this.canvasRef} id="canvas" />
        <Icon
          icon={uploadIcon}
          id="upload-icon"
          alt="Upload new version"
          style={{
            position: "absolute",
            color: "white",
            zIndex: 9999,
            top: 12,
            cursor: "pointer",
            right: 12,
            width: 24,
            height: 24,
            pointerEvents: "auto",
          }}
          onClick={() => {
            if (this.fileRef.current) {
              this.fileRef.current.click();
            }
          }}
          data-tip="Upload new version"
        />
        <input type="file" ref={this.fileRef} />
        <ReactTooltip />
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
            assetId={this.state.assetId}
            itemId={this.state.itemId}
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
