import React from "react";
import { listenToContext } from "./Api";
import "./App.css";
import CAD from "./CAD";
import FileExplorer from "./FileExplorer";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "files",
      itemId: "",
      boardId: "",
      url: "",
    };
  }

  componentDidMount() {
    // Get board ID and items
    listenToContext((boardId) => this.setState({ boardId }));
  }

  render() {
    switch (this.state.view) {
      case "CAD":
        return (
          <CAD
            url={this.state.url}
            itemId={this.state.itemId}
            columnId={this.state.colId}
            assetId={this.state.assetId}
          />
        );
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
