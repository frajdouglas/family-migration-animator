import "./App.css";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { along, length } from "@turf/turf";
import {
  exampleGeojson,
  point,
  blankGeojson,
  fraserFamilyStagedData,
  lizaFamilyStagedData,
  sessionStorageLatLongsData
} from "./exampleGeojson";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

function App() {
  // State and reference for timer
  const [time, setTime] = useState(1995);
  const timerRef = useRef();

  // Animation frame ref
  const requestIdArray = useRef([]);
  const stopAnimation = useRef(false);

  // Button disable state
  const [buttonDisableBoolean, setbuttonDisableBoolean] = useState(true);
  // Animation Speed State
  const [animationSpeed, setAnimationSpeed] = useState(100);

  // State and reference for table input
  const [name, setName] = useState("Boliver");
  const [year, setYear] = useState(2000);
  const [generation, setGeneration] = useState(1);
  const [origin, setOrigin] = useState("London");
  const [destination, setDestination] = useState("Manchester");

  const [stagedData, setStagedData] = useState([]);

  const latestYearRef = useRef(2002);
  const distinctYearsRef = useRef([2000, 2002]);
  const earliestYearRef = useRef(2000);

  // References and state for map
  const mapContainer = useRef();
  const [mapState, setMap] = useState(null);
  const [geom, setGeom] = useState(exampleGeojson);
  const geomBlank = useRef(blankGeojson);
  const points = useRef(point);

  // Timer refresh function
  const refreshTime = () => {
    setTime((time) => {
      return time + 1;
    });
  };
  const handleExampleClick = (e) => {
    const stagedDataLookup = {
      one: fraserFamilyStagedData,
      two: lizaFamilyStagedData,
    };
    let valueToStage = stagedDataLookup[e.currentTarget.value];
    setStagedData(valueToStage);
  };
  const handleAddition = (e) => {
    e.preventDefault();
    if (
      name === "" ||
      year === "" ||
      generation === "" ||
      origin === "" ||
      destination === ""
    ) {
      alert("Add data to fields");
    } else {
      if (stagedData.length === 0) {
        let stagedDataCopy = [...stagedData];
        // Clean strings of special characters and numbers
        setOrigin(origin.replace(/[^a-zA-Z ]/g, ""));
        setDestination(destination.replace(/[^a-zA-Z ]/g, ""));
        stagedDataCopy.push({
          id: 1,
          name: name,
          year: year,
          generation: generation,
          origin: origin,
          destination: destination,
        });
        setStagedData(stagedDataCopy);
      } else {
        let stagedDataCopy = [...stagedData];
        // Clean strings of special characters and numbers
        setOrigin((origin) => {
          origin = origin.replace(/[^a-zA-Z ]/g, "");
          return origin;
        });
        console.log("TRYING");
        setDestination((destination) => {
          destination = destination.replace(/[^a-zA-Z ]/g, "");
          return destination;
        });
        let idArray = stagedDataCopy.map((item) => {
          return Number(item.id);
        });
        let maxIdValue = Math.max(...idArray);
        let newId = maxIdValue + 1;
        stagedDataCopy.push({
          id: newId,
          name: name,
          year: year,
          generation: generation,
          origin: origin,
          destination: destination,
        });
        function compare(a, b) {
          if (a.year < b.year) {
            return -1;
          }
          if (a.year > b.year) {
            return 1;
          }
          return 0;
        }

        stagedDataCopy = stagedDataCopy.sort(compare);
        setStagedData(stagedDataCopy);
      }
    }
  };

  const handleDelete = (row) => {
    let idToDelete = row.id;
    let stagedDataCopy = [...stagedData];
    let newArray = stagedDataCopy.filter((item) => {
      return item.id !== idToDelete;
    });
    setStagedData(newArray);
  };

  const handleSubmit = () => {
    if (stagedData.length === 0) {
      alert("Add some data to the table first!");
    } else {
      setbuttonDisableBoolean(true);
      sessionStorage.setItem(
        "locationLookup",
        JSON.stringify(sessionStorageLatLongsData)
      );

      clearInterval(timerRef.current);
      let yearsArray = stagedData.map((item) => {
        return Number(item.year);
      });

      let distinctYears = [...new Set(yearsArray)];
      let earliestYear = Math.min(...distinctYears);
      let latestYear = Math.max(...distinctYears);
      latestYearRef.current = Number(latestYear);
      earliestYearRef.current = Number(earliestYear);
      distinctYearsRef.current = distinctYears;

      // Temp lookup to replace the sessionStorage when new data is retrieved
      let latLongLookup = {};
      // Merged Coordinates Geojson final form to return
      let reformattedRoutes = {
        type: "FeatureCollection",
        features: [],
      };
      let geojsonArray = [];
      let originArray = stagedData.map((item) => {
        return item.origin;
      });
      let destinationArray = stagedData.map((item) => {
        return item.destination;
      });
      let originDistinctArray = [...new Set(originArray)];
      let destinationDistinctArray = [...new Set(destinationArray)];
      let originsAndDestinationsArray = originDistinctArray.concat(
        destinationDistinctArray
      );
      let originsAndDestinationsDistinctArray = [
        ...new Set(originsAndDestinationsArray),
      ];
      originsAndDestinationsDistinctArray =
        originsAndDestinationsDistinctArray.map((item) => {
          return item.toLowerCase();
        });
      let locationLookup = JSON.parse(sessionStorage.getItem("locationLookup"));
      let locationsInLocalStorage = [];
      if (locationLookup !== null) {
        locationsInLocalStorage = Object.keys(locationLookup);
      }
      let locationsDifference = originsAndDestinationsDistinctArray.filter(
        (x) => !locationsInLocalStorage.includes(x)
      );

      // CONDITIONAL TO DEAL WITH NO FETCH CALLS NEEDED
      if (locationsDifference.length === 0) {
        console.log("NO FETCH NEEDED!");
        stagedData.forEach((item) => {
          let props = { ...item };
          props.origin = props.origin.toLowerCase();
          props.destination = props.destination.toLowerCase();
          props.oLat = Number(locationLookup[props.origin].lat);
          props.oLong = Number(locationLookup[props.origin].lon);
          props.dLat = Number(locationLookup[props.destination].lat);
          props.dLong = Number(locationLookup[props.destination].lon);
          let firstCoordinates = [props.oLong, props.oLat];
          let secondCoordinates = [props.dLong, props.dLat];

          let featureToPush = {
            type: "Feature",
            properties: props,
            geometry: {
              type: "LineString",
              coordinates: [firstCoordinates, secondCoordinates],
            },
          };
          geojsonArray.push(featureToPush);
        });

        // SEGMENT ROUTES INTO PARTS
        let steps = Number(animationSpeed);
        geojsonArray.forEach((item) => {
          const lineDistance = length(item);
          const arc = [];
          let i = 0;
          for (
            let loopCount = 0;
            loopCount < steps;
            i += lineDistance / steps
          ) {
            loopCount++;
            const segment = along(item, i);
            arc.push(segment.geometry.coordinates);
          }
          item.geometry.coordinates = arc;
        });

        geojsonArray.forEach((feature) => {
          reformattedRoutes.features.push(feature);
        });
        setGeom(reformattedRoutes);
      } else {
        let fetchCalls = locationsDifference.map((query) => {
          return fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?autocomplete=false&limit=1&access_token=${mapboxgl.accessToken}`
          );
        });
        fetchCalls.unshift(locationLookup);

        Promise.all(fetchCalls)
          .then((values) => {
            // get locationLookup from array
            let locationLookup = values.shift();
            let jsonParsedArray = values.map((item) => {
              return item.json();
            });
            jsonParsedArray.unshift(locationLookup);
            return Promise.all(jsonParsedArray);
          })
          .then((result) => {
            let locationLookup = result.shift();

            let zeroIndexArray = result.map((item) => {
              return item.features[0].geometry.coordinates;
            });
            for (let i = 0; i < locationsDifference.length; i++) {
              latLongLookup[locationsDifference[i]] = {
                lat: zeroIndexArray[i][1],
                lon: zeroIndexArray[i][0],
              };
            }
            let mergedLatLongLookup = { ...latLongLookup, ...locationLookup };
            sessionStorage.setItem(
              "locationLookup",
              JSON.stringify(mergedLatLongLookup)
            );

            stagedData.forEach((item) => {
              let props = { ...item };
              props.origin = props.origin.toLowerCase();
              props.destination = props.destination.toLowerCase();
              props.oLat = Number(mergedLatLongLookup[props.origin].lat);
              props.oLong = Number(mergedLatLongLookup[props.origin].lon);
              props.dLat = Number(mergedLatLongLookup[props.destination].lat);
              props.dLong = Number(mergedLatLongLookup[props.destination].lon);
              let firstCoordinates = [props.oLong, props.oLat];
              let secondCoordinates = [props.dLong, props.dLat];

              let featureToPush = {
                type: "Feature",
                properties: props,
                geometry: {
                  type: "LineString",
                  coordinates: [firstCoordinates, secondCoordinates],
                },
              };
              geojsonArray.push(featureToPush);
            });

            // SEGMENT ROUTES INTO PARTS
            let steps = Number(animationSpeed);
            geojsonArray.forEach((item) => {
              const lineDistance = length(item);
              const arc = [];
              let i = 0;
              for (
                let loopCount = 0;
                loopCount < steps;
                i += lineDistance / steps
              ) {
                loopCount++;
                const segment = along(item, i);
                arc.push(segment.geometry.coordinates);
              }
              item.geometry.coordinates = arc;
            });
            geojsonArray.forEach((feature) => {
              reformattedRoutes.features.push(feature);
            });
            setGeom(reformattedRoutes);
          });
      }
    }
  };

  useEffect(() => {
    sessionStorage.setItem(
      "locationLookup",
      JSON.stringify({
        "sheffield uk": { lat: 53.380662599999994, lon: -1.4702278 },
        "barrow in furness uk": { lat: 54.111335, lon: -3.228949 },
        "london uk": { lat: 51.507321899999994, lon: -0.12764739999999997 },
        "wakefield uk": { lat: 53.68295409999998, lon: -1.4967285999999997 },
        "leeds uk": { lat: 53.79741849999999, lon: -1.5437941 },
        "sale cheshire uk": { lat: 53.424494, lon: -2.318415 },
        "bolton uk": { lat: 53.578286, lon: -2.430037 },
        "nottingham uk": { lat: 52.905171, lon: -1.246652 },
        "manchester uk": { lat: 53.478265, lon: -2.248272 },
        "leicester uk": { lat: 52.63613979999999, lon: -1.1330789 },
        "stockport uk": { lat: 53.407901, lon: -2.160243 },
        "thurso uk": { lat: 58.595379, lon: -3.522476 },
        derby: { lat: 52.9212617, lon: -1.4761491 },
        "liverpool+uk": { lat: 53.407154, lon: -2.991665 },
        "derby uk": { lat: 52.9212617, lon: -1.4761491 },
        "coventry uk": { lat: 52.408181199999994, lon: -1.510477 },
        "lemington spa uk": { lat: 52.287381, lon: -1.52877 },
        "whistler canada": { lat: 50.11719, lon: -122.954302 },
        "brazil uk": { lat: 51.703998, lon: -0.6131 },
        "kingston upon thames uk": { lat: 51.409628, lon: -0.306262 },
        "birmingham uk": { lat: 52.479699199999985, lon: -1.9026910999999993 },
        "horbury yorkshire uk": { lat: 53.661169, lon: -1.554175 },
        "devon uk": { lat: 50.75, lon: -3.75 },
        "reading uk": { lat: 51.456659, lon: -0.969651 },
        bangalore: { lat: 12.9715987, lon: 77.5945627 },
        "barrow in furness": { lat: 54.108967, lon: -3.218894 },
        bolton: { lat: 53.57686469999999, lon: -2.4282192 },
        greece: { lat: 39.074208, lon: 21.824312 },
        iraq: { lat: 33.223191, lon: 43.679291 },
        leeds: { lat: 53.8007554, lon: -1.5490774 },
        leicester: { lat: 52.6368778, lon: -1.1397592 },
        manchester: { lat: 53.4807593, lon: -2.2426305 },
        nottingham: { lat: 52.9540223, lon: -1.1549892 },
        "sale cheshire": { lat: 53.42556099999999, lon: -2.323702 },
        sheffield: { lat: 36.0950743, lon: -80.2788466 },
        singapore: { lat: 1.352083, lon: 103.819836 },
        stockport: { lat: 53.41063159999999, lon: -2.1575332 },
        thurso: { lat: 58.593566, lon: -3.52208 },
        wakefield: { lat: 42.5039395, lon: -71.0723391 },
      })
    );

    // Initialise the map
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v10",
      center: [-2.24, 54.48],
      zoom: 7,
    });

    map.on("load", () => {
      // Add a source and layer displaying a point which will be animated in a circle.
      map.addSource("route", {
        type: "geojson",
        data: geomBlank.current,
      });
      map.addSource("pointsTEST", {
        type: "geojson",
        data: points.current,
      });

      map.addLayer({
        id: "routesBlackBackground",
        source: "route",
        type: "line",
        paint: {
          "line-width": 6,
          "line-opacity": 1,
          "line-color": "#000000",
        },
        layout: {
          "line-cap": "round",
        },
      });
      map.addLayer({
        id: "routesGlow1",
        source: "route",
        type: "line",
        paint: {
          "line-width": 5,
          "line-opacity": 1,
          "line-color": [
            "interpolate",
            ["linear"],
            ["get", "generation"],
            1,
            "#E66100",
            2,
            "#1AFF1A",
            3,
            "#5D3A9B",
            4,
            "#1A85FF",
            5,
            "#D35FB7",
          ],
        },
        layout: {
          "line-cap": "round",
        },
      });
      map.addLayer({
        id: "pointsTEST",
        source: "pointsTEST",
        type: "circle",
        layout: {},
        paint: {
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#000000",
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "generation"],
            1,
            "#E66100",
            2,
            "#1AFF1A",
            3,
            "#5D3A9B",
            4,
            "#1A85FF",
            5,
            "#D35FB7",
          ],
        },
        filter: ["!=", "visibleToggle", 0],
      });
      map.addLayer({
        id: "pointsLabels",
        source: "pointsTEST",
        type: "symbol",
        layout: {
          "text-field": ["get", "name"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": 0.5,
          "text-justify": "auto",
          "text-allow-overlap": true,
          "icon-image": ["get", "icon"],
          "text-size": 20,
        },
        paint: {
          "text-color": "#FFFFFF",
          "text-halo-color": "#000000",
          "text-halo-width": 1,
        },
        filter: ["!=", "visibleToggle", 0],
      });
      setMap(map);
    });

    // cleanup function to remove map on unmount

    return () => map.remove();
  }, []);

  useEffect(() => {

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
      // make routes geojson from geom state

      let routeToBeAddedTo = {
        type: "FeatureCollection",
        features: [],
      };

      // GET UNIQUE NAMES FROM ROUTES AND CREATE ONE POINT PER ROUTE IN SAME ORDER
      // ADD GENERATION HERE TO GET  COLOUR IN POINTS
      let namesList = geom.features.map((feature) => {
        return feature.properties.name;
      });
      let uniqueNames = [...new Set(namesList)];
      let generationsList = geom.features.map((feature) => {
        return feature.properties.generation;
      });

      let nameToGenerationLookup = {};
      for (let i = 0; i < namesList.length; i++) {
        nameToGenerationLookup[namesList[i]] = generationsList[i];
      }
      namesList.forEach((item) => {
        let routeFeatureTemplate = {
          type: "Feature",
          properties: { name: item, generation: nameToGenerationLookup[item] },
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        };
        routeToBeAddedTo.features.push(routeFeatureTemplate);
      });
      uniqueNames.forEach((item) => {
        let pointFeatureTemplate = {
          type: "Feature",
          properties: {
            name: item,
            generation: nameToGenerationLookup[item],
            visibleToggle: 0,
          },
          geometry: { type: "Point", coordinates: [0, 0] },
        };
        pointsNew.features.push(pointFeatureTemplate);
      });
      points.current = pointsNew;
      geomBlank.current = routeToBeAddedTo;
      mapState.getSource("route").setData(geomBlank.current);
      mapState.getSource("pointsTEST").setData(points.current);
      stopAnimation.current = false;

      setTime(earliestYearRef.current);
    }
  }, [mapState, geom]);

  useEffect(() => {
    if (distinctYearsRef.current.includes(time)) {
      let counter = 0;
      clearInterval(timerRef.current);
      let geomCopy = { ...geom };
      // THIS IS DUPLICATED LOGIC
      let namesList = geomCopy.features.map((feature) => {
        return feature.properties.name;
      });
      let uniqueNames = [...new Set(namesList)];
      geomCopy.features = geomCopy.features.filter((item) => {
        return Number(item.properties.year) === time;
      });
      let totalCycles = geomCopy.features[0].geometry.coordinates.length;
      function animate() {
        if (stopAnimation.current === false) {
          for (let i = 0; i < geomCopy.features.length; i++) {
            let routeName = geomCopy.features[i].properties.name;
            let indexOfNameForPoints = uniqueNames.indexOf(routeName);
            let indexOfNameForRoutes = namesList.indexOf(routeName);
            // Turn the labels and point visilbity back on
            points.current.features[
              indexOfNameForPoints
            ].properties.visibleToggle = 1;

            let start = geomCopy.features[i].geometry.coordinates[counter];
            let end = geomCopy.features[i].geometry.coordinates[counter + 1];
            if (start) {
              points.current.features[
                indexOfNameForPoints
              ].geometry.coordinates =
                geomCopy.features[i].geometry.coordinates[counter];

              geomBlank.current.features[
                indexOfNameForRoutes
              ].geometry.coordinates.push(
                geomCopy.features[i].geometry.coordinates[counter]
              );
            }

            if (end === undefined) {
              // ADD CUSTOM TOGGLE IN DATA
              points.current.features[
                indexOfNameForPoints
              ].properties.visibleToggle = 0;
            }
          }

          // Update the source with this new data
          mapState.getSource("pointsTEST").setData(points.current);
          mapState.getSource("route").setData(geomBlank.current);

          if (counter < totalCycles - 1) {
            setTimeout(function () {
              let requestId = requestAnimationFrame(animate);
              requestIdArray.current.push(requestId);
            }, 1000 / 100);
          } else {
            if (latestYearRef.current === time) {
              clearInterval(timerRef.current);
              setbuttonDisableBoolean(false);
            } else {
              timerRef.current = setInterval(refreshTime, 1000);
            }
          }
          counter = counter + 1;
        }
      }
      animate(counter);
    }
    if (latestYearRef.current === time) {
      clearInterval(timerRef.current);
    }
  }, [time]);

  useEffect(() => {
    timerRef.current = setInterval(refreshTime, 1000);
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);
  return (
    <div id="App">
      <div id="Clock">{time}</div>
      <div id="toolbar">
        <div id="title">Migration Animator</div>
        <Button
          onClick={handleExampleClick}
          id="addButton"
          value="one"
          variant="outlined"
          style={{ width: "200px" }}
        >
          Load Example 1
        </Button>
        <Button
          onClick={handleExampleClick}
          id="addButton"
          value="two"
          variant="outlined"
          style={{ width: "200px" }}
        >
          Load Example 2
        </Button>
        <form id="form">
          <fieldset id="inputsContainer">
            <TextField
              id="outlined-basic"
              defaultValue="Boliver"
              label="Name"
              variant="outlined"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <TextField
              id="outlined-basic"
              defaultValue="2000"
              label="Year"
              variant="outlined"
              onChange={(e) => {
                setYear(e.target.value);
              }}
            />
            <TextField
              id="outlined-basic"
              defaultValue="1"
              label="Generation"
              variant="outlined"
              onChange={(e) => {
                setGeneration(e.target.value);
              }}
            />
            <TextField
              id="outlined-basic"
              defaultValue="London"
              label="Origin"
              variant="outlined"
              onChange={(e) => {
                setOrigin(e.target.value);
              }}
            />
            <TextField
              id="outlined-basic"
              defaultValue="Manchester"
              label="Destination"
              variant="outlined"
              onChange={(e) => {
                setDestination(e.target.value);
              }}
            />
          </fieldset>
        </form>
        <Button
          onClick={handleAddition}
          id="addButton"
          variant="outlined"
          style={{ width: "200px" }}
        >
          Add
        </Button>
        <div id="dataContainer">
          {stagedData.map((item, index) => {
            if (item.year === time) {
              return (
                <div id="tableRowHighlighted" key={`${item}${index}`}>
                  <div className="tableItem">{item.name}</div>
                  <div className="tableItem">{item.year}</div>
                  <div className="tableItem">{item.generation}</div>
                  <div className="tableItem">{item.origin}</div>
                  <div className="tableItem">{item.destination}</div>
                  <button
                    onClick={() => handleDelete(item)}
                    style={{ width: "50px" }}
                  >
                    X
                  </button>
                </div>
              );
            } else {
              return (
                <div id="tableRow" key={`${item}${index}`}>
                  <div className="tableItem">{item.name}</div>
                  <div className="tableItem">{item.year}</div>
                  <div className="tableItem">{item.generation}</div>
                  <div className="tableItem">{item.origin}</div>
                  <div className="tableItem">{item.destination}</div>
                  <button onClick={() => handleDelete(item)}>X</button>
                </div>
              );
            }
          })}
        </div>
        {buttonDisableBoolean ? (
          <TextField
            id="outlined-basic"
            defaultValue="100"
            label="Animation Speed"
            variant="outlined"
            onChange={(e) => {
              setAnimationSpeed(e.target.value);
            }}
            disabled
          />
        ) : (
          <TextField
            id="outlined-basic"
            defaultValue="100"
            label="Animation Speed"
            variant="outlined"
            onChange={(e) => {
              setAnimationSpeed(e.target.value);
            }}
          />
        )}
        {buttonDisableBoolean ? (
          <Button id="submitButton" style={{ width: "200px" }} disabled>
            Start Animation
          </Button>
        ) : (
          <Button
            variant="contained"
            type="submit"
            onClick={handleSubmit}
            id="submitButton"
            style={{ width: "200px" }}
          >
            Start Animation
          </Button>
        )}
      </div>
      <div id="map" ref={mapContainer} />
    </div>
  );
}

export default App;
