import './App.css';
import React from "react";
import { useState, useRef, useEffect } from "react";
import { along, length } from "@turf/turf";
import { exampleGeojson, point } from "./exampleGeojson";
import maplibreGl from 'maplibre-gl';
import { handleSubmit } from './Utils/handleSubmit';

function App() {
  //TABLE INPUT STATE AND REF
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [generation, setGeneration] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stagedData, setStagedData] = useState([]);

  //MAP STATE AND REF
  const mapContainer = useRef();
  const [mapState, setMap] = useState(null);
  const [geom, setGeom] = useState(exampleGeojson);
  const [points, setPoints] = useState(point);
  const requestIdArray = useRef([]);


  console.log(geom, "GEOM HERE")
  // const cancelAllAnimationFrames = () => {
  //   // var id = window.requestAnimationFrame(function () {});
  //   // while (id--) {
  //   //   window.cancelAnimationFrame(id);
  //   // }
  //   console.log("cancelAllAnimationFrames ACTIVATED");
  //   console.log(requestIdArray.current);
  //   requestIdArray.current.forEach((id) => {
  //     console.log(id);
  //     // window.cancelAnimationFrame(id)
  //   });
  // };

  const handleAddition = (e) => {
    e.preventDefault();
    if (stagedData.length === 0) {
      setStagedData([
        {
          id: 1,
          name: name,
          year: year,
          generation: generation,
          origin: origin,
          destination: destination,
        },
      ]);
    } else {
      console.log(stagedData);
      let addedDataArray = [...stagedData];
      console.log(addedDataArray);
      let idArray = addedDataArray.map((item) => {
        return Number(item.id);
      });
      let maxIdValue = Math.max(...idArray);
      console.log(idArray);
      let newId = maxIdValue + 1;
      addedDataArray.push({
        id: newId,
        name: name,
        year: year,
        generation: generation,
        origin: origin,
        destination: destination,
      });
      console.log(addedDataArray);
      setStagedData(addedDataArray);
    }
  };

  const handleDelete = (row) => {
    console.log(row);
    let idToDelete = row.id;
    let addedDataArray = [...stagedData];
    let newArray = addedDataArray.filter((item) => {
      return item.id !== idToDelete;
    });
    setStagedData(newArray);
  };



  const handleTESTMAPCHANGE = () => {
    // THIS WORKS FINE!!!!!!!
    mapState.getSource("points").setData({
      type: "FeatureCollection",
      name: "markers",
      crs: {
        type: "name",
        properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
      },
      features: [
        {
          type: "Feature",
          properties: { id: 2 },
          geometry: { type: "Point", coordinates: [50, 50] },
        },
      ],
    });
    console.log("TEST BUTTON CLICKED");
  };
  // console.log(geom);
  useEffect(() => {
    const style = {
      "version": 8,
      "sources": {
        "osm": {
          "type": "raster",
          "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
          "tileSize": 256,
          "attribution": "&copy; OpenStreetMap Contributors",
          "maxzoom": 19
        }
      },
      "layers": [
        {
          "id": "osm",
          "type": "raster",
          "source": "osm" // This must match the source key above
        }
      ]
    };
    
    // Initialise the map
    const map = new maplibreGl.Map({
      container: 'map',
      style: style,
      center: [-2.24, 54.48],
      zoom: 7,
    });

    map.on("load", () => {
      // Add a source and layer displaying a point which will be animated in a circle.
      map.addSource("route", {
        type: "geojson",
        data: geom,
      });
      map.addSource("points", {
        type: "geojson",
        data: points,
      });
      map.addLayer({
        id: "routesBlackGlow1",
        source: "route",
        type: "line",
        paint: {
          "line-width": 10,
          "line-blur": 3,
          "line-opacity": 1,
          "line-color": [
            "interpolate",
            ["linear"],
            ["get", "generation"],
            0,
            "#EE000E",
            10,
            "#03ff03",
          ],
        },
      });
      map.addLayer({
        id: "routesBlackGlow2",
        source: "route",
        type: "line",
        paint: {
          "line-width": 5,
          "line-blur": 3,
          "line-opacity": 1,
          "line-color": [
            "interpolate",
            ["linear"],
            ["get", "generation"],
            0,
            "#EE000E",
            10,
            "#03ff03",
          ],
        },
      });
      map.addLayer({
        id: "routesBlackGlow3",
        source: "route",
        type: "line",
        paint: {
          "line-width": 1,
          "line-blur": 3,
          "line-opacity": 1,
          "line-color": [
            "interpolate",
            ["linear"],
            ["get", "generation"],
            0,
            "#EE000E",
            10,
            "#03ff03",
          ],
        },
      });

      map.addLayer({
        id: "points",
        source: "points",
        type: "circle",
        layout: {},
        paint: {
          "circle-color": "red",
        },
      });
      setMap(map);
    });

    // cleanup function to remove map on unmount

    return () => map.remove();
  }, []);

  useEffect(() => {
    // cancelAllAnimationFrames();
    if (mapState) {
      // make points geojson from geom state
      let pointsNew = {
        type: "FeatureCollection",
        name: "markers",
        crs: {
          type: "name",
          properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
        },
        features: [],
      };

      geom.features.forEach((item) => {
        console.log(item);
        // let personName = item.properties.name;
        let pointFeatureTemplate = {
          type: "Feature",
          properties: { id: 1 },
          geometry: { type: "Point", coordinates: [0, 0] },
        };
        pointsNew.features.push(pointFeatureTemplate);
      });
      setPoints(pointsNew);
      console.log(geom, "THIS SHOULD BE NEW");
      mapState.getSource("route").setData(geom);

      // Define animate function then start it, WOKRING BUT DON'T KNOW HOW TO STOP IT
      let counter = 0;

      function animate() {
        // console.log(counter)
        for (let i = 0; i < geom.features.length; i++) {
          // let currentRouteCounter = counterTracker[i];
          let start = geom.features[i].geometry.coordinates[counter];
          // console.log(start);
          let end = geom.features[i].geometry.coordinates[counter + 1];
          if (start) {
            points.features[i].geometry.coordinates =
              geom.features[i].geometry.coordinates[counter];
            geom.features[i].geometry.coordinates.push(
              geom.features[i].geometry.coordinates[counter]
            );
            // counterTracker[i]++;
          }
        }

        // Update the source with this new data
        mapState.getSource("points").setData(points);
        if (counter < 100) {
          setTimeout(function () {
            let requestId = requestAnimationFrame(animate);
            requestIdArray.current.push(requestId);
            // console.log(requestIdArray)
          }, 1000 / 1);
        }
        counter = counter + 1;
      }
      animate(counter);
    }
  }, [mapState, geom]);

  if (stagedData.length === 0) {
    return (
      <div id="App">
        <div id="toolbar">
          <button onClick={handleTESTMAPCHANGE}>TESTBUTTON</button>
          <form>
            <fieldset id="inputsContainer">
              <label>
                <p>Name</p>
                <input
                  required
                  className="inputBox"
                  name="name"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                />
              </label>
              <label>
                <p>Year</p>
                <input
                  className="inputBox"
                  year="year"
                  onChange={(e) => {
                    setYear(e.target.value);
                  }}
                  value={year}
                />
              </label>
              <label>
                <p>Generation</p>
                <input
                  className="inputBox"
                  generation="generation"
                  onChange={(e) => {
                    setGeneration(e.target.value);
                  }}
                  value={generation}
                />
              </label>
              <label>
                <p>Origin</p>
                <input
                  className="inputBox"
                  origin="origin"
                  onChange={(e) => {
                    setOrigin(e.target.value);
                  }}
                  value={origin}
                />
              </label>
              <label>
                <p>Destination</p>
                <input
                  className="inputBox"
                  destination="destination"
                  onChange={(e) => {
                    setDestination(e.target.value);
                  }}
                  value={destination}
                />
              </label>
            </fieldset>
            <button onClick={handleAddition}>u</button>
          </form>
        </div>
        <div
          id="map"
          ref={mapContainer}
          style={{ width: "60%", height: "100vh" }}
        />
      </div>
    );
  } else {
    return (
      <div id="App">
        <div id="toolbar">
          <form>
            <fieldset id="inputsContainer">
              <label>
                <p>Name</p>
                <input
                  required
                  className="inputBox"
                  name="name"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                />
              </label>
              <label>
                <p>Year</p>
                <input
                  className="inputBox"
                  year="year"
                  onChange={(e) => {
                    setYear(e.target.value);
                  }}
                  value={year}
                />
              </label>
              <label>
                <p>Generation</p>
                <input
                  className="inputBox"
                  generation="generation"
                  onChange={(e) => {
                    setGeneration(e.target.value);
                  }}
                  value={generation}
                />
              </label>
              <label>
                <p>Origin</p>
                <input
                  className="inputBox"
                  origin="origin"
                  onChange={(e) => {
                    setOrigin(e.target.value);
                  }}
                  value={origin}
                />
              </label>
              <label>
                <p>Destination</p>
                <input
                  className="inputBox"
                  destination="destination"
                  onChange={(e) => {
                    setDestination(e.target.value);
                  }}
                  value={destination}
                />
              </label>
            </fieldset>
            <button onClick={handleAddition}>u</button>
          </form>

          {stagedData.map((item) => {
            return (
              <div id="tableRow">
                <div className="tableItem">{item.name}</div>
                <div className="tableItem">{item.year}</div>
                <div className="tableItem">{item.generation}</div>
                <div className="tableItem">{item.origin}</div>
                <div className="tableItem">{item.destination}</div>
                <button onClick={() => handleDelete(item)}>X</button>
              </div>
            );
          })}
          <button type="submit" onClick={() => {
            handleSubmit(stagedData).then((result) => {
              setGeom(result)
            })
          }}>
            Submit
          </button>
        </div>
        <div
          id="map"
          ref={mapContainer}
          style={{ width: "100%", height: "100vh" }}
        />
      </div>
    );
  }
};

export default App;






  