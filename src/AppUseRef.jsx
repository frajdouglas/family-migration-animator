import "./App.css";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { along, length } from "@turf/turf";
import { exampleGeojson, point } from "./exampleGeojson";
import maplibreGl from "maplibre-gl";

function App() {
  // Year counter state
  const [time, setTime] = useState(1995);
  const timerRef = useRef();

  //TABLE INPUT STATE AND REF
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [generation, setGeneration] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  // const [stagedData, setStagedData] = useState([]);
  const stagedData = useRef([]);
  const yearsRef = useRef(2030);
  const distinctYearsRef = useRef([2000, 2005]);

  //MAP STATE AND REF
  const mapContainer = useRef();
  const [mapState, setMap] = useState(null);
  const [geom, setGeom] = useState(exampleGeojson);
  // const [points, setPoints] = useState(point);
  const points = useRef(point);
  const requestIdArray = useRef([]);

  // Timer refresh function
  const refreshTime = () => {
    setTime((time) => {
      return time + 1;
    });
  };

  // console.log(stagedData, mapContainer.current);

  const cancelAllAnimationFrames = () => {
    // var id = window.requestAnimationFrame(function () {});
    // while (id--) {
    //   window.cancelAnimationFrame(id);
    // }
    // console.log("cancelAllAnimationFrames ACTIVATED");
    // console.log(requestIdArray.current);
    requestIdArray.current.forEach((id) => {
      // console.log(id);
      // window.cancelAnimationFrame(id)
    });
  };
const handleTest = () => {

  let copyStagedData = [{
    id: 1,
    name: 'fraser',
    year: 1995,
    generation: 2,
    origin: 'derby',
    destination: 'london'
  },
  {
    id: 2,
    name: 'fraser',
    year: 2000,
    generation: 2,
    origin: 'london',
    destination: 'edinburgh'
  },
  {
    id: 3,
    name: 'fraser',
    year: 2005,
    generation: 2,
    origin: 'edinburgh',
    destination: 'berlin'
  },
  {
    id: 4,
    name: 'fraser',
    year: 2015,
    generation: 2,
    origin: 'berlin',
    destination: 'budapest'
  }
]
  stagedData.current = copyStagedData
  console.log(stagedData.current)
  let yearsArray = stagedData.current.map((item) => {
    return item.year;
  });

  let distinctYears = [...new Set(yearsArray)];
  distinctYears= distinctYears.map((item) => {
    return Number(item)
  })
  let earliestYear = Math.min(...distinctYears);
  let latestYear = Math.max(...distinctYears);
  yearsRef.current = Number(latestYear);
  distinctYearsRef.current = distinctYears;

  // Sort out geometry
  let latLongLookup = {};
  // Merged Coordinates Geojson final form to return
  let reformattedRoutes = {
    type: "FeatureCollection",
    // name: "routes",
    // crs: {
    //   type: "name",
    //   properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
    // },
    features: [],
  };
  let geojsonArray = [];
  // New format suggestion, Get distinct values of origin and destination
  // Then do Promise all for all fetches and store responses.
  // Then loop through rows and create a geojson for each and return value
  let originArray = stagedData.current.map((item) => {
    return item.origin;
  });
  let destinationArray = stagedData.current.map((item) => {
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
  let fetchCalls = originsAndDestinationsDistinctArray.map((query) => {
    return fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
  });

  Promise.all(fetchCalls)
    .then((values) => {
      let jsonParsedArray = values.map((item) => {
        return item.json();
      });
      return Promise.all(jsonParsedArray);
    })
    .then((result) => {
      let zeroIndexArray = result.map((item) => {
        return item[0];
      });
      for (let i = 0; i < originsAndDestinationsDistinctArray.length; i++) {
        latLongLookup[originsAndDestinationsDistinctArray[i]] = {
          lat: zeroIndexArray[i]["lat"],
          lon: zeroIndexArray[i]["lon"],
        };
      }
      stagedData.current.forEach((item) => {
        let props = { ...item };
        props.oLat = Number(latLongLookup[props.origin].lat);
        props.oLong = Number(latLongLookup[props.origin].lon);
        props.dLat = Number(latLongLookup[props.destination].lat);
        props.dLong = Number(latLongLookup[props.destination].lon);
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
      let steps = 1000;
      geojsonArray.forEach((item) => {
        const lineDistance = length(item);
        const arc = [];
        let arcCount = 0;
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

      // Get unique list of names
      let uniqueNames = geojsonArray.map((item) => {
        return item.properties.name;
      });
      uniqueNames = [...new Set(uniqueNames)];
      // For each name get an array of routes with each name
      // let uniqueNamesObject = {};
      uniqueNames.forEach((name) => {
        let groupedByArray = geojsonArray.filter((personRoute) => {
          return personRoute.properties.name === name;
        });

        // Sort by year
        groupedByArray.sort((a, b) => a.properties.year - b.properties.year);
        // Merge coordinates
        let mergedCoordinates = [];
        let sharedProperties = {};
        groupedByArray.forEach((item) => {
          sharedProperties = item.properties;
          let firstFeaturesCoords = item.geometry.coordinates;
          mergedCoordinates = mergedCoordinates.concat(firstFeaturesCoords);
        });
        sharedProperties.generation = Number(sharedProperties.generation);
        delete sharedProperties.origin;
        delete sharedProperties.destination;
        delete sharedProperties.id;
        delete sharedProperties.oLat;
        delete sharedProperties.dLat;
        delete sharedProperties.oLong;
        delete sharedProperties.dLong;

        let objectToPush = {
          type: "Feature",
          properties: sharedProperties,
          geometry: {
            type: "LineString",
            coordinates: mergedCoordinates,
          },
        };
        reformattedRoutes.features.push(objectToPush);
      });
      // console.log(reformattedRoutes);
      setTime(earliestYear)
      setGeom(reformattedRoutes);
    });
}

  const handleAddition = (e) => {
    e.preventDefault();
    if (stagedData.current.length === 0) {
      // setStagedData([
      //   {
      //     id: 1,
      //     name: name,
      //     year: year,
      //     generation: generation,
      //     origin: origin,
      //     destination: destination,
      //   },
      // ]);
      let copyStagedData = [{
        id: 1,
        name: name,
        year: year,
        generation: generation,
        origin: origin,
        destination: destination
      }]
      stagedData.current = copyStagedData
    } else {
      // console.log(stagedData);
      let addedDataArray = [...stagedData.current];
      // console.log(addedDataArray);
      let idArray = addedDataArray.map((item) => {
        return Number(item.id);
      });
      let maxIdValue = Math.max(...idArray);
      // console.log(idArray);
      let newId = maxIdValue + 1;
      addedDataArray.push({
        id: newId,
        name: name,
        year: year,
        generation: generation,
        origin: origin,
        destination: destination,
      });
      // console.log(addedDataArray);
      stagedData.current = addedDataArray
      // setStagedData(addedDataArray);
    }
  };

  const handleDelete = (row) => {
    // console.log(row);
    let idToDelete = row.id;
    let addedDataArray = [...stagedData.current];
    let newArray = addedDataArray.filter((item) => {
      return item.id !== idToDelete;
    });
    stagedData.current = newArray
    // setStagedData(newArray);
  };
  const handleSubmit = () => {
    // tableDataToLineGeojson(stagedData)
    // .then((newData) => {
    //   console.log(newData);
    //   setGeom(newData);
    // });
    console.log(stagedData.current)
    let yearsArray = stagedData.current.map((item) => {
      return item.year;
    });

    let distinctYears = [...new Set(yearsArray)];
    distinctYears= distinctYears.map((item) => {
      return Number(item)
    })
    let earliestYear = Math.min(...distinctYears);
    let latestYear = Math.max(...distinctYears);
    yearsRef.current = Number(latestYear);
    distinctYearsRef.current = distinctYears;

    // Sort out geometry
    let latLongLookup = {};
    // Merged Coordinates Geojson final form to return
    let reformattedRoutes = {
      type: "FeatureCollection",
      // name: "routes",
      // crs: {
      //   type: "name",
      //   properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
      // },
      features: [],
    };
    let geojsonArray = [];
    // New format suggestion, Get distinct values of origin and destination
    // Then do Promise all for all fetches and store responses.
    // Then loop through rows and create a geojson for each and return value
    let originArray = stagedData.current.map((item) => {
      return item.origin;
    });
    let destinationArray = stagedData.current.map((item) => {
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
    let fetchCalls = originsAndDestinationsDistinctArray.map((query) => {
      return fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
    });

    Promise.all(fetchCalls)
      .then((values) => {
        let jsonParsedArray = values.map((item) => {
          return item.json();
        });
        return Promise.all(jsonParsedArray);
      })
      .then((result) => {
        let zeroIndexArray = result.map((item) => {
          return item[0];
        });
        for (let i = 0; i < originsAndDestinationsDistinctArray.length; i++) {
          latLongLookup[originsAndDestinationsDistinctArray[i]] = {
            lat: zeroIndexArray[i]["lat"],
            lon: zeroIndexArray[i]["lon"],
          };
        }
        stagedData.current.forEach((item) => {
          let props = { ...item };
          props.oLat = Number(latLongLookup[props.origin].lat);
          props.oLong = Number(latLongLookup[props.origin].lon);
          props.dLat = Number(latLongLookup[props.destination].lat);
          props.dLong = Number(latLongLookup[props.destination].lon);
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
        let steps = 1000;
        geojsonArray.forEach((item) => {
          const lineDistance = length(item);
          const arc = [];
          let arcCount = 0;
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

        // Get unique list of names
        let uniqueNames = geojsonArray.map((item) => {
          return item.properties.name;
        });
        uniqueNames = [...new Set(uniqueNames)];
        // For each name get an array of routes with each name
        // let uniqueNamesObject = {};
        uniqueNames.forEach((name) => {
          let groupedByArray = geojsonArray.filter((personRoute) => {
            return personRoute.properties.name === name;
          });

          // Sort by year
          groupedByArray.sort((a, b) => a.properties.year - b.properties.year);
          // Merge coordinates
          let mergedCoordinates = [];
          let sharedProperties = {};
          groupedByArray.forEach((item) => {
            sharedProperties = item.properties;
            let firstFeaturesCoords = item.geometry.coordinates;
            mergedCoordinates = mergedCoordinates.concat(firstFeaturesCoords);
          });
          sharedProperties.generation = Number(sharedProperties.generation);
          delete sharedProperties.origin;
          delete sharedProperties.destination;
          delete sharedProperties.id;
          delete sharedProperties.oLat;
          delete sharedProperties.dLat;
          delete sharedProperties.oLong;
          delete sharedProperties.dLong;

          let objectToPush = {
            type: "Feature",
            properties: sharedProperties,
            geometry: {
              type: "LineString",
              coordinates: mergedCoordinates,
            },
          };
          reformattedRoutes.features.push(objectToPush);
        });
        // console.log(reformattedRoutes);
        setTime(earliestYear)
        setGeom(reformattedRoutes);
      });
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
        {
          type: "Feature",
          properties: { id: 1 },
          geometry: { type: "Point", coordinates: [50, 50] },
        },
      ],
    });
    // console.log("TEST BUTTON CLICKED");
  };

  useEffect(() => {
    timerRef.current = setInterval(refreshTime, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const style = {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap Contributors",
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm", // This must match the source key above
        },
      ],
    };

    // Initialise the map
    const map = new maplibreGl.Map({
      container: "map",
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
        data: points.current,
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
    cancelAllAnimationFrames();
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
        // console.log(item);
        // let personName = item.properties.name;
        let pointFeatureTemplate = {
          type: "Feature",
          properties: { id: 1 },
          geometry: { type: "Point", coordinates: [0, 0] },
        };
        pointsNew.features.push(pointFeatureTemplate);
      });
      // setPoints(pointsNew);
      points.current = pointsNew;
      // console.log(geom, "THIS SHOULD BE NEW");
      // console.log(pointsNew, "THIS SHOULD BE NEW POINTS");

      mapState.getSource("route").setData(geom);


    }
  }, [mapState, geom]);

  useEffect(() => {
    console.log(distinctYearsRef.current,time);
    if (distinctYearsRef.current.includes(time)) {
      let counter = 0;
      clearInterval(timerRef.current);
      // Filter geom to just get the right years
      let geomCopy = { ...geom };
      geomCopy.features = geomCopy.features.filter((item) => {
        return Number(item.properties.year) === time;
      });
      console.log(geomCopy);
      let totalCycles = geomCopy.features[0].geometry.coordinates.length
console.log(counter)
      function animate() {
        // console.log(counter)
        for (let i = 0; i < geomCopy.features.length; i++) {
          // let currentRouteCounter = counterTracker[i];
          let start = geomCopy.features[i].geometry.coordinates[counter];
          // console.log(start);
          let end = geomCopy.features[i].geometry.coordinates[counter + 1];
          console.log(end)
          if (start) {
            points.current.features[i].geometry.coordinates =
              geomCopy.features[i].geometry.coordinates[counter];
            geomCopy.features[i].geometry.coordinates.push(
              geomCopy.features[i].geometry.coordinates[counter]
            );
            console.log(points.current)
            // counterTracker[i]++;
          }
        }

        // Update the source with this new data
        mapState.getSource("points").setData(points.current);
        // console.log(counter);
        if (counter < totalCycles) {
          setTimeout(function () {
            let requestId = requestAnimationFrame(animate);
            requestIdArray.current.push(requestId);
            // console.log(requestIdArray)
          }, 1000 / 100);
        } else {
          timerRef.current = setInterval(refreshTime, 1000);
        }
        counter = counter + 1;
      }
      animate(counter);
    }

    if (yearsRef.current === time) {
      // console.log(time);
      clearInterval(timerRef.current);
    }
  }, [time]);

  if (stagedData.length === 0) {
    return (
      <div id="App">
        <div id="toolbar">
          <div id="Clock">{time}</div>;
          <button onClick={handleTest}>TEST BUTTON</button>
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
        <div id="Clock">{time}</div>;
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
            <button onClick={handleTest}>TEST BUTTON</button>

            <button onClick={handleAddition}>u</button>
          </form>

          {stagedData.current.map((item) => {
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
          <button type="submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <div
          id="map"
          ref={mapContainer}
          style={{ width: "60%", height: "100vh" }}
        />
      </div>
    );
  }
}

export default App;
