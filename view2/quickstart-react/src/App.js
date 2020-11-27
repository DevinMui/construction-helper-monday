import React from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
//import Redirect from "Redirect.js"
const monday = mondaySdk();


class App extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            settings: {},
            name: "",
            listitems: ["List Item 1", "List Item 2", "List Item 3"],
        };
    }

    componentDidMount() {
        monday.listen("settings", res => {
            this.setState({ settings: res.data });
        });

        monday.listen("context", res => {
            this.setState({ context: res.data });
            console.log(res.data);
            monday.api(`query ($boardIds: [Int]) { boards (ids:$boardIds) { name items(limit:1) { name column_values { title text } } } }`,
                { variables: { boardIds: this.state.context.boardIds } }
            )
                .then(res => {
                    this.setState({ boardData: res.data });
                });
        })

        // {JSON.stringify(this.state.boardData, null, 2)}
    } 
 

   returnLink()
   {
       //return <form><input type="button" value="Redirect Me" onclick="Redirect" /></form>;
       return "i";
   }

    render() {
        return (
            <div className="App" style={{ background: (this.state.settings.background) }}>
               Select Plots of Land
               <ul className="list-group">
                    {this.state.listitems.map(listitem => (
                        <li className="list-group-item list-group-item-primary">
                            {this.returnLink()}
                        </li>
                    ))}
                </ul>
            </div>

        );
    }
}

export default App;
