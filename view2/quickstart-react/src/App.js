import React from "react";
import "./App.css";
import { LineChart } from "react-d3-components";
import mondaySdk from "monday-sdk-js";
import { Card } from '@material-ui/core';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveCalendar } from '@nivo/calendar';
import calendarData from './calData.js'

const monday = mondaySdk();



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
    },
    {
        "id": "us",
        "color": "hsl(217, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 274
            },
            {
                "x": "helicopter",
                "y": 34
            },
            {
                "x": "boat",
                "y": 62
            },
            {
                "x": "train",
                "y": 26
            },
            {
                "x": "subway",
                "y": 85
            },
            {
                "x": "bus",
                "y": 48
            },
            {
                "x": "car",
                "y": 297
            },
            {
                "x": "moto",
                "y": 46
            },
            {
                "x": "bicycle",
                "y": 294
            },
            {
                "x": "horse",
                "y": 244
            },
            {
                "x": "skateboard",
                "y": 186
            },
            {
                "x": "others",
                "y": 194
            }
        ]
    },
    {
        "id": "germany",
        "color": "hsl(240, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 273
            },
            {
                "x": "helicopter",
                "y": 214
            },
            {
                "x": "boat",
                "y": 69
            },
            {
                "x": "train",
                "y": 206
            },
            {
                "x": "subway",
                "y": 259
            },
            {
                "x": "bus",
                "y": 267
            },
            {
                "x": "car",
                "y": 255
            },
            {
                "x": "moto",
                "y": 179
            },
            {
                "x": "bicycle",
                "y": 257
            },
            {
                "x": "horse",
                "y": 62
            },
            {
                "x": "skateboard",
                "y": 257
            },
            {
                "x": "others",
                "y": 173
            }
        ]
    },
    {
        "id": "norway",
        "color": "hsl(286, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 60
            },
            {
                "x": "helicopter",
                "y": 235
            },
            {
                "x": "boat",
                "y": 128
            },
            {
                "x": "train",
                "y": 39
            },
            {
                "x": "subway",
                "y": 211
            },
            {
                "x": "bus",
                "y": 278
            },
            {
                "x": "car",
                "y": 200
            },
            {
                "x": "moto",
                "y": 234
            },
            {
                "x": "bicycle",
                "y": 258
            },
            {
                "x": "horse",
                "y": 66
            },
            {
                "x": "skateboard",
                "y": 134
            },
            {
                "x": "others",
                "y": 259
            }
        ]
    }
];

var tooltipScatter = function (x, y) {
    return "x: " + x + " y: " + y;
};



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

    async parsePricePoint(variable, aDataPoint) {
        tempDataPoint.x = variable["items"][0]["column_values"][3]["value"];
        tempDataPoint.y = variable["items"][0]["column_values"][4]["value"];
        console.log(tempDataPoint);
        aDataPoint.push(tempDataPoint);
    }

    parseData(variable) {
        var allHomes = variable["boards"][0]["items"];
        var allHomePrices = [];
        var i, j;
        var propertyArray = [];
        for (i = 0; i < allHomes["length"]; i++)
        {
            var aDataPoint = [];
            var oneHomeJson = allHomes[i]["column_values"];
            var pricePoints = oneHomeJson["14"]["value"];
            var address = oneHomeJson["0"]["value"];
            var jsonParsedPricePoints = JSON.parse(pricePoints);
            //console.log(jsonParsedPricePoints["linkedPulseIds"]["length"]);
            for (j = 0; j < jsonParsedPricePoints["linkedPulseIds"]["length"]; j++) {
                var subtableID = jsonParsedPricePoints["linkedPulseIds"][j]["linkedPulseId"];
                
                var query = "query { items(ids: " + subtableID + ") { id column_values { id type value } } }";
                var dataPoint = new data("", "");
                var exper = "hi";
                monday.api(query).then(res => { await this.parsePricePoint(res.data, aDataPoint); exper = res.data; });
                console.log(exper);
                
            }
            var property = {id: address, color: colorArray[i], data: aDataPoint};
            propertyArray.push(property);
        }
        console.log(data2);
        console.log(propertyArray);
        data2 = propertyArray;
    }

    constructor(props) {
        super(props);

        // Default state
        this.state = {
            settings: {},
            name: "",
            boardData: {},
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

                <div style={{ height: 400 }}>
                    <ResponsiveCalendar
                        data={calendarData}
                        from="2015-03-01"
                        to="2016-07-12"
                        emptyColor="#eeeeee"
                        colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
                        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                        yearSpacing={40}
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
                </div>
            </div>

        );
    }
}

export default App;
