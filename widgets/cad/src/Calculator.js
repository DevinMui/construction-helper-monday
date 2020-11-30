import React from "react";
import Select from "react-select";

const NodeSTL = require("node-stl");

const request = require("request");
const requestSettings = {
  method: "GET",
  url: "https://s3.amazonaws.com/minifactory-stl/WALLY_1plate.stl",
  encoding: null,
};

// Get scale
// Get material cost [with selection]

const units = [
  {
    label: "cm",
    value: 1 / 1000000,
  },
  { label: "m", value: 1 },
  { label: "in", value: 61023.7 },
  { label: "ft", value: 35.315 },
  { label: "yd", value: 1.30795 },
];
const materials = [
  // Cost per unit m^3
  {
    value: 250,
    label: "Brick",
  },
  {
    value: 117,
    label: "Concrete",
  },
  {
    value: 847.44,
    label: "European Oak",
  },
  {
    value: 6767,
    label: "Steel",
  },
];

const Calculator = (props) => {
  const [volume, setVolume] = React.useState(1);
  const [materialCost, setMaterialCost] = React.useState(1);
  const [materialUnit, setMaterialUnit] = React.useState(1);

  const [numUnit, setNumUnit] = React.useState(1);
  const materialInputRef = React.useRef(null);

  const [materialSelectValue, setMaterialSelectValue] = React.useState(null);

  React.useEffect(() => {
    requestSettings.url = props.url;
    request(requestSettings, function (error, _, body) {
      if (error) return;
      var stl = new NodeSTL(body);
      setVolume(stl.volume);
    });
  }, [props.url]);

  console.log({numUnit , materialUnit , materialCost , volume})

  return (
    <div className="price">
      <h1>Price</h1>
      <h4>STL Units</h4>
      <div className="input-row">
        <input type="number" onChange={e => setNumUnit(e.target.value)} />
        <Select
          options={units}
          defaultValue={units[1]}
          onChange={setMaterialUnit}
        />
      </div>
      <h4>Material Cost</h4>
      <div className="input-row">
        <input
          type="number"
          ref={materialInputRef}
          onChange={(v) => {
            setMaterialCost(v.target.value);
            setMaterialSelectValue(null);
          }}
        />
        <Select
          options={materials}
          placeholder=""
          value={materialSelectValue}
          onChange={(e) => {
            if (materialInputRef.current) {
              materialInputRef.current.value = "";
            }
            setMaterialCost(e.value);
            setMaterialSelectValue(e);
          }}
        />
      </div>
      <div className="est-cost-row">
        <h3>Est. Cost</h3>
        <h2>${Math.round((+numUnit) * (+materialUnit) * (+materialCost) * (+volume) * 100)/100}</h2>
      </div>
    </div>
  );
};
// Units slider + some selection
// Material cost slider + some selection
export default Calculator;
