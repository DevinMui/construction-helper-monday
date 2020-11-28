import React from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();


class Redirect extends React.Component {

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            settings: {},
            name: "",
        };
    }

    componentDidMount() {
    }


    render() {
        return (
            <div className="Redirect" style={{ background: coral; }}>
               Sasdf
            </div>

        );
    }
}

export default Redirect;
