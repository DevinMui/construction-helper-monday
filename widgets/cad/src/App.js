import React from "react";
import { listenToContext } from "./Api";
import "./App.css";
import CAD from "./CAD";
import FileExplorer from "./FileExplorer";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "files",
      itemId: "",
      boardId: "",
      url: "",
      link: "",
      assetId: ""
    };
  }

  componentDidMount() {
    // Get board ID and items
    listenToContext((boardId) => this.setState({ boardId }));
    monday.listen("settings", (e) => {
      console.log(e.data.link)
      this.setState({ link: e.data.link });
    });
  }

  render() {
    switch (this.state.view) {
      case "CAD":
        return <CAD {...this.state} />;
      default:
        // 'files' as default
        return (
          <FileExplorer
            id={this.state.boardId}
            onSubmit={(e) => this.setState({ ...e, view: "CAD" })}
          />
        );
    }
  }
}

// Save new item
// Delete annotation confirmation

export default App;
