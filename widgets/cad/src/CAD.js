import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Viewer } from "@xeokit/xeokit-sdk/src/viewer/Viewer.js";
import { STLLoaderPlugin } from "@xeokit/xeokit-sdk/src/plugins/STLLoaderPlugin/STLLoaderPlugin.js";
import { AnnotationsPlugin } from "@xeokit/xeokit-sdk/src/plugins/AnnotationsPlugin/AnnotationsPlugin.js";
import Alert from "./Alert";
import trash2 from "@iconify-icons/feather/trash-2";
import { InlineIcon } from "@iconify/react";
import xIcon from "@iconify-icons/feather/x";

function uuid() {
  return uuidv4();
}

class CAD extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.canvasRef = React.createRef();
    // Default state
    this.state = {
      alert: false,
      saving: false,
      annotation: false,
    };
  }

  componentDidMount() {
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
    this.annotations.on("markerClicked", (annotation) => {
      if (this.state.annotation) {
        this.state.annotation.setLabelShown(false);
      }
      annotation.setLabelShown(true);
      this.setState({ annotation });
      viewer.cameraFlight.flyTo(annotation);
    });
    const model = this.stlViewer.load({
      id: "myModel",
      src: (this.props.link || "") + this.props.url,
      // metaModelSrc:   "./models/OTCConferenceCenter.json"
    });
    model.on("loaded", () => {
      console.log("loaded");
      viewer.cameraFlight.jumpTo(model);
    });

    viewer.scene.input.on("mouseclicked", (coords) => {
      var pickRecord = viewer.scene.pick({
        canvasPos: coords,
        pickSurface: true, // <<------ This causes picking to find the intersection point on the entity
      });
      if (pickRecord) {
        const id = uuid();

        this.setState({
          alert: {
            type: "add",
            annotations: this.annotations,
            info: {
              pickRecord,
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
                <InlineIcon
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
                />
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
