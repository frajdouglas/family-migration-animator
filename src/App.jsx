import "./App.css";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { along, length } from "@turf/turf";
import { exampleGeojson, point } from "./exampleGeojson";
import maplibreGl from "maplibre-gl";

function App() {
  // State and reference for timer
  const [time, setTime] = useState(1995);
  const timerRef = useRef();

  // State and reference for table input
  const [name, setName] = useState("a");
  const [year, setYear] = useState(2);
  const [generation, setGeneration] = useState(1);
  const [origin, setOrigin] = useState("s");
  const [destination, setDestination] = useState("d");

  // Initial table data for testing
  // COMMENT OUT TO SELECT TEST SCENARIOS

  // single route and name
  // const [stagedData, setStagedData] = useState([
  //   {
  //     id: 1,
  //     name: "fraser",
  //     year: 1995,
  //     generation: 10,
  //     origin: "derby",
  //     destination: "london",
  //   }
  // ]);

  // different names but same start year
  const [stagedData, setStagedData] = useState([
    {
      id: 2,
      name: "fraser",
      year: 2000,
      generation: 10,
      origin: "london",
      destination: "edinburgh",
    },
    {
      id: 5,
      name: "Megan",
      year: 2000,
      generation: 5,
      origin: "skegness",
      destination: "oslo",
    },
  ]);

  // multiple routes, single name
  // const [stagedData, setStagedData] = useState([
  //   {
  //     id: 1,
  //     name: "fraser",
  //     year: 1995,
  //     generation: 10,
  //     origin: "derby",
  //     destination: "london",
  //   },
  //   {
  //     id: 2,
  //     name: "fraser",
  //     year: 2000,
  //     generation: 10,
  //     origin: "london",
  //     destination: "edinburgh",
  //   },
  //   {
  //     id: 3,
  //     name: "fraser",
  //     year: 2005,
  //     generation: 10,
  //     origin: "edinburgh",
  //     destination: "berlin",
  //   },
  //   {
  //     id: 4,
  //     name: "fraser",
  //     year: 2015,
  //     generation: 10,
  //     origin: "berlin",
  //     destination: "budapest",
  //   },
  // ]);

  // multiple routes, multiple names
  // const [stagedData, setStagedData] = useState([
  //   {
  //     id: 1,
  //     name: "fraser",
  //     year: 1995,
  //     generation: 10,
  //     origin: "derby",
  //     destination: "london",
  //   },
  //   {
  //     id: 2,
  //     name: "fraser",
  //     year: 2000,
  //     generation: 10,
  //     origin: "london",
  //     destination: "edinburgh",
  //   },
  //   {
  //     id: 3,
  //     name: "fraser",
  //     year: 2005,
  //     generation: 10,
  //     origin: "edinburgh",
  //     destination: "berlin",
  //   },
  //   {
  //     id: 4,
  //     name: "fraser",
  //     year: 2015,
  //     generation: 10,
  //     origin: "berlin",
  //     destination: "budapest",
  //   },
  //   {
  //     id: 5,
  //     name: "Megan",
  //     year: 2001,
  //     generation: 5,
  //     origin: "skegness",
  //     destination: "oslo",
  //   },
  //   {
  //     id: 6,
  //     name: "Megan",
  //     year: 2020,
  //     generation: 5,
  //     origin: "oslo",
  //     destination: "dover",
  //   },
  // ]);

  // more than 2 peoples
  // const [stagedData, setStagedData] = useState([
  //   {
  //     id: 1,
  //     name: "fraser",
  //     year: 1995,
  //     generation: 10,
  //     origin: "derby",
  //     destination: "london",
  //   },
  //   {
  //     id: 2,
  //     name: "rowan",
  //     year: 2000,
  //     generation: 1,
  //     origin: "london",
  //     destination: "edinburgh",
  //   },
  //   {
  //     id: 3,
  //     name: "megan",
  //     year: 2005,
  //     generation: 3,
  //     origin: "craven arms",
  //     destination: "berlin",
  //   },

  // ]);

  // Multiple route, multiple names, jumbled order

  // const [stagedData, setStagedData] = useState([
  //   {
  //     id: 2,
  //     name: "fraser",
  //     year: 2000,
  //     generation: 10,
  //     origin: "london",
  //     destination: "edinburgh",
  //   },
  //   {
  //     id: 6,
  //     name: "Megan",
  //     year: 2020,
  //     generation: 5,
  //     origin: "oslo",
  //     destination: "dover",
  //   },
  //   {
  //     id: 3,
  //     name: "fraser",
  //     year: 2005,
  //     generation: 10,
  //     origin: "edinburgh",
  //     destination: "berlin",
  //   },
  //   {
  //     id: 4,
  //     name: "fraser",
  //     year: 2015,
  //     generation: 10,
  //     origin: "berlin",
  //     destination: "budapest",
  //   },
  //   {
  //     id: 5,
  //     name: "Megan",
  //     year: 2001,
  //     generation: 5,
  //     origin: "skegness",
  //     destination: "oslo",
  //   },
  //   {
  //     id: 1,
  //     name: "fraser",
  //     year: 1995,
  //     generation: 10,
  //     origin: "derby",
  //     destination: "london",
  //   },
  // ]);

  // const [stagedData, setStagedData] = useState([]);

  // Reference for years data
  const latestYearRef = useRef(2030);
  const distinctYearsRef = useRef([2000, 2005]);
  const earliestYearRef = useRef(2000);

  // References and state for map
  const mapContainer = useRef();
  const [mapState, setMap] = useState(null);
  const [geom, setGeom] = useState(exampleGeojson);
  const points = useRef(point);
  const requestIdArray = useRef([]);

  // Timer refresh function
  const refreshTime = () => {
    setTime((time) => {
      return time + 1;
    });
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

    // Sort out geometry
    let latLongLookup = {};
    // Merged Coordinates Geojson final form to return
    let reformattedRoutes = {
      type: "FeatureCollection",
      features: [],
    };
    let geojsonArray = [];
    // New format suggestion, Get distinct values of origin and destination
    // Then do Promise all for all fetches and store responses.
    // Then loop through rows and create a geojson for each and return value
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
        stagedData.forEach((item) => {
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
        let steps = 500;
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
         
        });
        geojsonArray.forEach((feature) => {
          reformattedRoutes.features.push(feature);
        });
        setGeom(reformattedRoutes);
      });
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
            "#03ff03",
            10,
            "#EE000E",
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
            "#03ff03",
            10,
            "#EE000E",
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
            "#03ff03",
            10,
            "#EE000E",
          ],
        },
      });

      map.addLayer({
        id: "points",
        source: "points",
        type: "circle",
        layout: {},
        paint: {
          "circle-color": [
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

      uniqueNames.forEach((item) => {
        let pointFeatureTemplate = {
          type: "Feature",
          properties: { name: item, generation: nameToGenerationLookup[item] },
          geometry: { type: "Point", coordinates: [0, 0] },
        };
        pointsNew.features.push(pointFeatureTemplate);
      });
      points.current = pointsNew;
      mapState.getSource("route").setData(geom);
      setTime(earliestYearRef.current);
    }
  }, [mapState, geom]);

  useEffect(() => {
    // console.log(geom,"GEOM IN TIME USEEFFECT")

    if (distinctYearsRef.current.includes(time)) {
      console.log(distinctYearsRef.current, time);

      let counter = 0;
      clearInterval(timerRef.current);
      let geomCopy = { ...geom };
      geomCopy.features = geomCopy.features.filter((item) => {
        return Number(item.properties.year) === time;
      });
      let totalCycles = geomCopy.features[0].geometry.coordinates.length;
      // THIS IS DUPLICATED LOGIC
      let namesList = geom.features.map((feature) => {
        return feature.properties.name;
      });
      let uniqueNames = [...new Set(namesList)];

      function animate() {
        for (let i = 0; i < geomCopy.features.length; i++) {
          let routeName = geomCopy.features[i].properties.name;
          let indexOfName = uniqueNames.indexOf(routeName);
          let start = geomCopy.features[i].geometry.coordinates[counter];
          let end = geomCopy.features[i].geometry.coordinates[counter + 1];
          if (start) {
            points.current.features[indexOfName].geometry.coordinates =
              geomCopy.features[i].geometry.coordinates[counter];
            // geomCopy.features[i].geometry.coordinates.push(
            //   geomCopy.features[i].geometry.coordinates[counter]
            // );
            // console.log(points.current);
            // counterTracker[i]++;
          }
        }

        // Update the source with this new data
        mapState.getSource("points").setData(points.current);
        if (counter < totalCycles - 1) {
          setTimeout(function () {
            let requestId = requestAnimationFrame(animate);
            requestIdArray.current.push(requestId);
          }, 1000 / 100);
        } else {
          if (latestYearRef.current === time) {
            console.log("STOP ANIMATION");
            clearInterval(timerRef.current);
          } else {
            timerRef.current = setInterval(refreshTime, 1000);
          }
        }
        counter = counter + 1;
      }
      animate(counter);
    }
    if (latestYearRef.current === time) {
      console.log("STOP ANIMATION");
      clearInterval(timerRef.current);
    }
  }, [time]);

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

          <button onClick={handleAddition}>u</button>
        </form>

        {stagedData.map((item, index) => {
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

export default App;
