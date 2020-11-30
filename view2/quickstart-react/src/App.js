import React from "react";
import "./App.css";
import { LineChart } from "react-d3-components";
import mondaySdk from "monday-sdk-js";
import { Card } from '@material-ui/core';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveCalendar } from '@nivo/calendar';
import sk from './calData.js'

const monday = mondaySdk();

let calendarData = [
    [
        {
        "day": "2017-08-23",
        "value": 397
        },
        {
            "day": "2017-08-04",
            "value": 79
        }
    ], [],[],[]
];

let data2 = [
    {
        "id": "japan",
        "color": "hsl(36, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 211
            },
            {
                "x": "helicopter",
                "y": 206
            },
            {
                "x": "boat",
                "y": 3
            },
            {
                "x": "train",
                "y": 85
            },
            {
                "x": "subway",
                "y": 252
            },
            {
                "x": "bus",
                "y": 136
            },
            {
                "x": "car",
                "y": 38
            },
            {
                "x": "moto",
                "y": 206
            },
            {
                "x": "bicycle",
                "y": 121
            },
            {
                "x": "horse",
                "y": 242
            },
            {
                "x": "skateboard",
                "y": 211
            },
            {
                "x": "others",
                "y": 242
            }
        ]
    },
    {
        "id": "france",
        "color": "hsl(170, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 27
            },
            {
                "x": "helicopter",
                "y": 295
            },
            {
                "x": "boat",
                "y": 191
            },
            {
                "x": "train",
                "y": 153
            },
            {
                "x": "subway",
                "y": 156
            },
            {
                "x": "bus",
                "y": 237
            },
            {
                "x": "car",
                "y": 42
            },
            {
                "x": "moto",
                "y": 125
            },
            {
                "x": "bicycle",
                "y": 38
            },
            {
                "x": "horse",
                "y": 247
            },
            {
                "x": "skateboard",
                "y": 54
            },
            {
                "x": "others",
                "y": 113
            }
        ]
    }
];

var tooltipScatter = function (x, y) {
    return "x: " + x + " y: " + y;
};

//let mappy = new Map();
var setty = [];
var homeNumber = 0;
var nameArray = [];
var promises = [];
var propertyArray = [];
var calendarArray = [];
var tempDataPoint = {};
var colorArray = ["hsl(36, 70%, 50%)", "hsl(170, 70%, 50%)", "hsl(217, 70%, 50%)", "hsl(240, 70%, 50%)", "hsl(286, 70%, 50%)"];



class data {
    constructor(date, price) {
        this.x = date;
        this.y = price;
    }
};



//'query { items(ids: 881258594) { id column_values { id type value } } }'

class App extends React.Component {

    subCalendarItem(dataVar, address) {
        
        var length = dataVar["length"];
        if (length != 0) {
            var endDate = new Date(dataVar[length - 1]["day"]);
            var startDate = new Date(dataVar[0]["day"]);
            return (<div style={{ height: 500 }}>
                <div >
                    <h2>
                        {address}
                    </h2>
                </div>
                <ResponsiveCalendar
                    data={dataVar}
                    from={dataVar[0]["day"]}
                    to={dataVar[length - 1]["day"]}
                    emptyColor="#eeeeee"
                    colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
                    margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                    yearSpacing={40}
                    minValue={dataVar[0]["value"]}
                    maxValue={dataVar[length - 1]["value"]}
                    monthBorderColor="#ffffff"
                    dayBorderWidth={2}
                    dayBorderColor="#ffffff"
                    legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'row',
                            translateY: 36,
                            itemCount: 4,
                            itemWidth: 42,
                            itemHeight: 36,
                            itemsSpacing: 14,
                            itemDirection: 'right-to-left'
                        }
                    ]}
                />
            </div>);
        }
        else {
            return (<div></div>);
        }
        
    }
    renderCalendarItems() {

        
        var returnObj =[];
        var i = 0; 
        for (i = 0; i < homeNumber; i++) {
            var dataVar = calendarData[i];
            returnObj.push(this.subCalendarItem(dataVar, nameArray[i]));
        
            //returnObj +=" <div style={{ height: 400 }}>" + 
            //                " <ResponsiveCalendar" +
            //                    "data = {" + dataVar + "}" +
            //                    "from = \"2015 - 03 - 01\"" +
            //                    "to = \"2016 - 07 - 12\"" +
            //                    "emptyColor = \"#eeeeee\"" +
            //                    "colors = { ['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}" +
            //                    "margin = {{ top: 40, right: 40, bottom: 40, left: 40 }}" +
            //                    "yearSpacing = { 40}" +
            //                    "minValue={ 350000 }" +
            //                    "maxValue = { 400000}" +
            //                    "monthBorderColor = \"#ffffff\"" +
            //                    "dayBorderWidth = { 2}" +
            //                    "dayBorderColor = \"#ffffff\"" +
            //                    "legends = {" +
            //                        "[{" +
            //                            "anchor: 'bottom-right'," +
            //                            "direction: 'row'," +
            //                            "translateY: 36," +
            //                            "itemCount: 4," +
            //                            "itemWidth: 42," +
            //                            "itemHeight: 36," +
            //                            "itemsSpacing: 14," +
            //                            "itemDirection: 'right-to-left'" +
            //                        "}]}" +
            //                " /></div> ";
        }
        return returnObj;
    }
    
    parsePricePoint(variable, aDataPoint, address) {
        var k, n, m = 0; 
        for (n = 0; n < homeNumber; n++) {
            var property = { id: nameArray[n], color: colorArray[n], data:[]};
            propertyArray[n] = property;
            calendarArray[n] = [];
        }

        for (k = 0; k < variable["length"]; k++) {
            variable[k].then(res =>
            {
                var idValue = res.data["items"][0]["id"];
                n = 0;
                var found = false;
                for (n = 0; n < homeNumber; n++) {
                    for (var it = setty[n].values(), val = null; val = it.next().value;) {
                        if (val == idValue) {
                            found = true;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
                if (!res.data["items"][0]["column_values"][3]["value"] || !res.data["items"][0]["column_values"][4]["value"]) {
                    ;
                }
                else {
                    var d = new Date(parseInt(res.data["items"][0]["column_values"][3]["value"].replaceAll('"', ''), 10)); // The 0 there is the key, which sets the date to the epoch
                    var month = ("0" + (d.getMonth() + 1)).slice(-2)
                    var day = d.getUTCDate();
                    var year = d.getUTCFullYear();
                    var newdate = month + "/" + day + "/" + year;
                    var caldate = year + "-" + month + "-" + day;
                    propertyArray[n].data.push({ x: newdate, y: (res.data["items"][0]["column_values"][4]["value"].replaceAll('"', '')) });
                    calendarArray[n].push({ day: caldate, value: parseInt((res.data["items"][0]["column_values"][4]["value"].replaceAll('"', '')), 10) });
                }
                if (m == (variable["length"] - 1)) {
                    data2 = propertyArray;
                    this.setState({ data2: propertyArray });
                    this.setState({ calendarData: calendarArray });
                    calendarData = calendarArray;
                }
                m++;
               
            });
        }
    }

    parseData(variable) {
        var allHomes = variable["boards"][0]["items"];
        var allHomePrices = [];
        var i, j;
        var propertyArray = [];
        homeNumber = allHomes["length"];
        for (i = 0; i < homeNumber; i++)
        {
            var aDataPoint = [];
            var oneHomeJson = allHomes[i]["column_values"];
            var pricePoints = oneHomeJson["14"]["value"];
            var address = oneHomeJson["0"]["value"];
            var jsonParsedPricePoints = JSON.parse(pricePoints);
            var listOfIDs = [];
            var subset = new Set();
            nameArray.push(address);
            for (j = 0; j < jsonParsedPricePoints["linkedPulseIds"]["length"]; j++) {
                var subtableID = jsonParsedPricePoints["linkedPulseIds"][j]["linkedPulseId"];
                subset.add(subtableID);
                var query = "query { items(ids: " + subtableID + ") { id column_values { id type value } } }";
                var dataPoint = new data("", "");
                promises.push(monday.api(query)); //(res => { this.parsePricePoint(res.data, aDataPoint); });
                
            }
            setty[i] = subset;
            Promise.all(promises).then(res => { this.parsePricePoint(promises, aDataPoint, address, ); });
            
        }
        //console.log(data2);
        //console.log(propertyArray);
        //data2 = propertyArray;
    }

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            settings: {},
            name: "",
            boardData: {},
            data2: [],
            calendarData: [],
        };
    }

    randomData = (e) => {
        e.preventDefault();
        this.setState((prevState) => {
            const data = prevState.data.map(d => ({
                name: d.name,
                value: Math.floor((Math.random() * 100) + 1)
            }))
            return {
                data
            }
        })
    }

    componentDidMount() {
        monday.listen("settings", res => {
            this.setState({ settings: res.data });
        });

        monday.listen("context", res => {
            this.setState({ context: res.data });
            //console.log(res.data);
            monday.api('query { boards(ids: [878537780]) { items { name group { id } column_values { id value text }  } }}',
                { variables: { boardIds: this.state.context.boardIds } }
            )
                .then(res => {
                    this.setState({ boardData: res.data });
                });
        })

        monday.api('query { boards(ids: [878537780]) { items { name group { id } column_values { id value text }  } }}').then(res => { this.parseData(res.data); });
        console.log("TESTing");
        //console.log(variable);
    } 

    render() {
        return (
            <div style={{ background: (this.state.settings.background), paddingLeft: 100, paddingTop: 100 }}>
                <div style={{ height: 400 }}>
                    <ResponsiveLine
                        data={data2}
                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
                        yFormat=" >-.2f"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'transportation',
                            legendOffset: 36,
                            legendPosition: 'middle'
                        }}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'count',
                            legendOffset: -40,
                            legendPosition: 'middle'
                        }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'left-to-right',
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: 'circle',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </div>
                
                
           
                {this.renderCalendarItems()}
            </div>
        );
    }
}

export default App;
