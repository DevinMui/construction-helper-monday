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
      assetId: "",
      token: ""
    };
  }

  componentDidMount() {
    // Get board ID and items
    listenToContext((boardId) => this.setState({ boardId }));
    monday.listen("settings", (e) => {
      this.setState({ link: e.data.link, token: e.data.token });
    });
  }

  render() {
    switch (this.state.view) {
      case "CAD":
        return <CAD token={this.state.token} {...this.state} />;
      default:
        // 'files' as default
        return (
          <FileExplorer
            id={this.state.boardId}
            token={this.state.token}
            onSubmit={(e) => this.setState({ ...e, view: "CAD" })}
          />
        );
    }
  }
}

// Save new item
// Delete annotation confirmation

export default App;
