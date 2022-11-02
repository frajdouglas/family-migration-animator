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
  //     origin: "Derby",
  //     destination: "london",
  //   }
  // ]);

  // different names but same start year
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
  //     id: 5,
  //     name: "Megan",
  //     year: 2000,
  //     generation: 5,
  //     origin: "skegness",
  //     destination: "oslo",
  //   },
  // ]);

  // multiple routes, single name
  const [stagedData, setStagedData] = useState([
    {
      id: 1,
      name: "fraser",
      year: 1995,
      generation: 10,
      origin: "Derby",
      destination: "london",
    },
    {
      id: 2,
      name: "fraser",
      year: 2000,
      generation: 10,
      origin: "london",
      destination: "edinburgh",
    },
    {
      id: 3,
      name: "fraser",
      year: 2005,
      generation: 10,
      origin: "edinburgh",
      destination: "berlin",
    },
    {
      id: 4,
      name: "fraser",
      year: 2015,
      generation: 10,
      origin: "berlin",
      destination: "budapest",
    },
  ]);

  // multiple routes, multiple names
  // const [stagedData, setStagedData] = useState([
  //   {
  //     id: 1,
  //     name: "fraser",
  //     year: 1995,
  //     generation: 10,
  //     origin: "Derby",
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
  //     origin: "Derby",
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
  //     origin: "Derby",
  //     destination: "london",
  //   },
  // ]);

  // const [stagedData, setStagedData] = useState([]);

  // Reference for years data

  // DOUGLAS WOLSTENHOLME FAMILY TREE

  // const [stagedData, setStagedData] = useState([
  //   {
  //     id: 1,
  //     name: "George Eddleston",
  //     year: 1915,
  //     generation: 1,
  //     origin: "Sheffield",
  //     destination: "Iraq",
  //   },
  //   {
  //     id: 2,
  //     name: "George Eddleston",
  //     year: 1918,
  //     generation: 1,
  //     origin: "Iraq",
  //     destination: "Sheffield",
  //   },
  //   {
  //     id: 3,
  //     name: "William Wolstenholme",
  //     year: 1915,
  //     generation: 1,
  //     origin: "Sheffield",
  //     destination: "Barrow In Furness",
  //   },
  //   {
  //     id: 4,
  //     name: "William Wolstenholme",
  //     year: 1918,
  //     generation: 1,
  //     origin: "Barrow In Furness",
  //     destination: "Sheffield",
  //   },
  //   {
  //     id: 5,
  //     name: "Mystery Dance",
  //     year: 1925,
  //     generation: 1,
  //     origin: "London",
  //     destination: "Bangalore",
  //   },
  //   {
  //     id: 6,
  //     name: "Mystery Dance",
  //     year: 1936,
  //     generation: 1,
  //     origin: "Bangalore",
  //     destination: "Sale cheshire",
  //   },
  //   {
  //     id: 7,
  //     name: "Edward Dance",
  //     year: 1920,
  //     generation: 1,
  //     origin: "Wakefield",
  //     destination: "Leeds",
  //   },
  //   {
  //     id: 8,
  //     name: "Edward Dance",
  //     year: 1923,
  //     generation: 1,
  //     origin: "Leeds",
  //     destination: "Bangalore",
  //   },
  //   {
  //     id: 9,
  //     name: "Edward Dance",
  //     year: 1936,
  //     generation: 1,
  //     origin: "Bangalore",
  //     destination: "Sale cheshire",
  //   },
  //   {
  //     id: 10,
  //     name: "Edward Dance",
  //     year: 1936,
  //     generation: 1,
  //     origin: "Sale cheshire",
  //     destination: "Horbury yorkshire",
  //   },
  //   {
  //     id: 11,
  //     name: "John Douglas",
  //     year: 1914,
  //     generation: 1,
  //     origin: "Bolton",
  //     destination: "Barrow In Furness",
  //   },
  //   {
  //     id: 12,
  //     name: "John Douglas",
  //     year: 1957,
  //     generation: 1,
  //     origin: "Barrow In Furness",
  //     destination: "Stockport",
  //   },
  //   {
  //     id: 13,
  //     name: "Kathleen Wolstenholme",
  //     year: 1942,
  //     generation: 2,
  //     origin: "Sheffield",
  //     destination: "Nottingham",
  //   },
  //   {
  //     id: 14,
  //     name: "Kathleen Wolstenholme",
  //     year: 1957,
  //     generation: 2,
  //     origin: "Nottingham",
  //     destination: "Sheffield",
  //   },
  //   {
  //     id: 15,
  //     name: "Eric Wolstenholme",
  //     year: 1942,
  //     generation: 2,
  //     origin: "Sheffield",
  //     destination: "Devon",
  //   },
  //   {
  //     id: 16,
  //     name: "Eric Wolstenholme",
  //     year: 1945,
  //     generation: 2,
  //     origin: "Sheffield",
  //     destination: "Greece",
  //   },
  //   {
  //     id: 17,
  //     name: "Eric Wolstenholme",
  //     year: 1946,
  //     generation: 2,
  //     origin: "Greece",
  //     destination: "Sheffield",
  //   },
  //   {
  //     id: 18,
  //     name: "Christina Douglas",
  //     year: 1936,
  //     generation: 2,
  //     origin: "Bangalore",
  //     destination: "Sale Cheshire",
  //   },
  //   {
  //     id: 19,
  //     name: "Christina Douglas",
  //     year: 1954,
  //     generation: 2,
  //     origin: "Sale Cheshire",
  //     destination: "Manchester",
  //   },
  //   {
  //     id: 20,
  //     name: "Christina Douglas",
  //     year: 1957,
  //     generation: 2,
  //     origin: "Manchester",
  //     destination: "Stockport",
  //   },
  //   {
  //     id: 21,
  //     name: "Joseph Douglas",
  //     year: 1945,
  //     generation: 2,
  //     origin: "Barrow In Furness",
  //     destination: "Singapore",
  //   },
  //   {
  //     id: 22,
  //     name: "Joseph Douglas",
  //     year: 1947,
  //     generation: 2,
  //     origin: "Singapore",
  //     destination: "Manchester",
  //   },
  //   {
  //     id: 23,
  //     name: "Joseph Douglas",
  //     year: 1957,
  //     generation: 2,
  //     origin: "Manchester",
  //     destination: "Stockport",
  //   },
  //   {
  //     id: 24,
  //     name: "Alison Douglas",
  //     year: 1976,
  //     generation: 3,
  //     origin: "Sheffield",
  //     destination: "Leicester",
  //   },
  //   {
  //     id: 25,
  //     name: "Alison Douglas",
  //     year: 1980,
  //     generation: 3,
  //     origin: "Leicester",
  //     destination: "Sheffield",
  //   },
  //   {
  //     id: 26,
  //     name: "Alison Douglas",
  //     year: 1981,
  //     generation: 3,
  //     origin: "Sheffield",
  //     destination: "Derby",
  //   },
  //   {
  //     id: 27,
  //     name: "Jeremy Douglas",
  //     year: 1957,
  //     generation: 3,
  //     origin: "Manchester",
  //     destination: "Stockport",
  //   },
  //   {
  //     id: 28,
  //     name: "Jeremy Douglas",
  //     year: 1972,
  //     generation: 3,
  //     origin: "Stockport",
  //     destination: "Liverpool",
  //   },
  //   {
  //     id: 29,
  //     name: "Jeremy Douglas",
  //     year: 1976,
  //     generation: 3,
  //     origin: "Stockport",
  //     destination: "Leicester",
  //   },
  //   {
  //     id: 30,
  //     name: "Jeremy Douglas",
  //     year: 1979,
  //     generation: 3,
  //     origin: "Leicester",
  //     destination: "Thurso",
  //   },
  //   {
  //     id: 31,
  //     name: "Jeremy Douglas",
  //     year: 1981,
  //     generation: 3,
  //     origin: "Thurso",
  //     destination: "Derby",
  //   },
  //   {
  //     id: 32,
  //     name: "Fraser Douglas",
  //     year: 2013,
  //     generation: 4,
  //     origin: "Derby",
  //     destination: "Liverpool",
  //   },
  //   {
  //     id: 33,
  //     name: "Fraser Douglas",
  //     year: 2017,
  //     generation: 4,
  //     origin: "Liverpool",
  //     destination: "Derby",
  //   },
  //   {
  //     id: 34,
  //     name: "Fraser Douglas",
  //     year: 2018,
  //     generation: 4,
  //     origin: "Derby",
  //     destination: "Liverpool",
  //   },
  //   {
  //     id: 35,
  //     name: "Fraser Douglas",
  //     year: 2019,
  //     generation: 4,
  //     origin: "Liverpool",
  //     destination: "Derby",
  //   },
  //   {
  //     id: 36,
  //     name: "Fraser Douglas",
  //     year: 2021,
  //     generation: 4,
  //     origin: "Derby",
  //     destination: "Manchester",
  //   },
  //   {
  //     id: 37,
  //     name: "Rowan Douglas",
  //     year: 2010,
  //     generation: 4,
  //     origin: "Derby",
  //     destination: "Coventry",
  //   },
  //   {
  //     id: 38,
  //     name: "Rowan Douglas",
  //     year: 2011,
  //     generation: 4,
  //     origin: "Coventry",
  //     destination: "Lemington Spa",
  //   },
  //   {
  //     id: 39,
  //     name: "Rowan Douglas",
  //     year: 2013,
  //     generation: 4,
  //     origin: "Lemington Spa",
  //     destination: "Coventry",
  //   },
  //   {
  //     id: 40,
  //     name: "Rowan Douglas",
  //     year: 2014,
  //     generation: 4,
  //     origin: "Coventry",
  //     destination: "London",
  //   },
  //   {
  //     id: 41,
  //     name: "Rowan Douglas",
  //     year: 2019,
  //     generation: 4,
  //     origin: "London",
  //     destination: "Whistler Canada",
  //   },
  //   {
  //     id: 42,
  //     name: "Rowan Douglas",
  //     year: 2020,
  //     generation: 4,
  //     origin: "Whistler Canada",
  //     destination: "Brazil",
  //   },
  //   {
  //     id: 43,
  //     name: "Rowan Douglas",
  //     year: 2021,
  //     generation: 4,
  //     origin: "Brazil",
  //     destination: "London",
  //   },
  //   {
  //     id: 44,
  //     name: "Rebecca Douglas",
  //     year: 2008,
  //     generation: 4,
  //     origin: "Derby",
  //     destination: "Kingston Upon Thames",
  //   },
  //   {
  //     id: 45,
  //     name: "Rebecca Douglas",
  //     year: 2009,
  //     generation: 4,
  //     origin: "Kingston Upon Thames",
  //     destination: "Derby",
  //   },
  //   {
  //     id: 46,
  //     name: "Rebecca Douglas",
  //     year: 2012,
  //     generation: 4,
  //     origin: "Derby",
  //     destination: "Birmingham",
  //   },
  //   {
  //     id: 47,
  //     name: "Rebecca Douglas",
  //     year: 2015,
  //     generation: 4,
  //     origin: "Birmingham",
  //     destination: "Reading",
  //   },
  // ]);

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
    // localStorage.setItem("locationLookup", JSON.stringify({ london: {lat: '52.9212617', lon: '-1.4761491'},budapest: {lat: '52.9212617', lon: '-1.4761491'},edinburgh: {lat: '52.9212617', lon: '-1.4761491'},berlin: {lat: '52.9212617', lon: '-1.4761491'} }));

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

    // Temp lookup to replace the localStorage when new data is retrieved
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
    originsAndDestinationsDistinctArray = originsAndDestinationsDistinctArray.map((item) => {
      return item.toLowerCase()
    })
    console.log(originsAndDestinationsDistinctArray);
    let locationLookup = JSON.parse(localStorage.getItem("locationLookup"));
    console.log(locationLookup);
    let locationsInLocalStorage = [];
    if (locationLookup !== null) {
      locationsInLocalStorage = Object.keys(locationLookup);
    }
    let locationsDifference = originsAndDestinationsDistinctArray.filter(
      (x) => !locationsInLocalStorage.includes(x)
    );
    console.log(locationsDifference);

    // CONDITIONAL TO DEAL WITH NO FETCH CALLS NEEDED
    if (locationsDifference.length === 0) {
      console.log("NO FETCH NEEDED!");
      stagedData.forEach((item) => {
        let props = { ...item };
        props.origin = props.origin.toLowerCase()
        props.destination = props.destination.toLowerCase()
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

      geojsonArray.forEach((feature) => {
        reformattedRoutes.features.push(feature);
      });
      setGeom(reformattedRoutes);

    } else {
      let fetchCalls = locationsDifference.map((query) => {
        return fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
      });
      fetchCalls.unshift(locationLookup);

      Promise.all(fetchCalls)
        .then((values) => {
          console.log(values);
          // get locationLookup from array
          let locationLookup = values.shift();
          console.log(locationLookup);
          let jsonParsedArray = values.map((item) => {
            return item.json();
          });
          console.log(jsonParsedArray);
          jsonParsedArray.unshift(locationLookup);
          return Promise.all(jsonParsedArray);
        })
        .then((result) => {
          console.log(result);
          let locationLookup = result.shift();
          console.log(locationLookup);

          let zeroIndexArray = result.map((item) => {
            return item[0];
          });
          console.log(zeroIndexArray);
          console.log(originsAndDestinationsDistinctArray);
          for (let i = 0; i < locationsDifference.length; i++) {
            console.log(locationsDifference[i]);
            latLongLookup[locationsDifference[i]] = {
              lat: zeroIndexArray[i]["lat"],
              lon: zeroIndexArray[i]["lon"],
            };
            console.log(latLongLookup);
          }
          console.log(locationLookup);
          let mergedLatLongLookup = { ...latLongLookup, ...locationLookup };
          console.log(mergedLatLongLookup);
          localStorage.setItem(
            "locationLookup",
            JSON.stringify(mergedLatLongLookup)
          );

          stagedData.forEach((item) => {
            let props = { ...item };
            props.origin = props.origin.toLowerCase()
            props.destination = props.destination.toLowerCase()
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
          // let uniqueNames = geojsonArray.map((item) => {
          //   return item.properties.name;
          // });
          // uniqueNames = [...new Set(uniqueNames)];
          // // For each name get an array of routes with each name
          // // let uniqueNamesObject = {};
          // uniqueNames.forEach((name) => {
          //   let groupedByArray = geojsonArray.filter((personRoute) => {
          //     return personRoute.properties.name === name;
          //   });

          //   // Sort by year
          //   groupedByArray.sort((a, b) => a.properties.year - b.properties.year);
          // });
          geojsonArray.forEach((feature) => {
            reformattedRoutes.features.push(feature);
          });
          setGeom(reformattedRoutes);
        });
    }

    // .then((result) => {
    //   let zeroIndexArray = result.map((item) => {
    //     return item[0];
    //   });
    //   for (let i = 0; i < originsAndDestinationsDistinctArray.length; i++) {
    //     latLongLookup[originsAndDestinationsDistinctArray[i]] = {
    //       lat: zeroIndexArray[i]["lat"],
    //       lon: zeroIndexArray[i]["lon"],
    //     };
    //   }
    //   stagedData.forEach((item) => {
    //     let props = { ...item };
    //     props.oLat = Number(latLongLookup[props.origin].lat);
    //     props.oLong = Number(latLongLookup[props.origin].lon);
    //     props.dLat = Number(latLongLookup[props.destination].lat);
    //     props.dLong = Number(latLongLookup[props.destination].lon);
    //     let firstCoordinates = [props.oLong, props.oLat];
    //     let secondCoordinates = [props.dLong, props.dLat];

    //     let featureToPush = {
    //       type: "Feature",
    //       properties: props,
    //       geometry: {
    //         type: "LineString",
    //         coordinates: [firstCoordinates, secondCoordinates],
    //       },
    //     };
    //     geojsonArray.push(featureToPush);
    //   });

    //   // SEGMENT ROUTES INTO PARTS
    //   let steps = 500;
    //   geojsonArray.forEach((item) => {
    //     const lineDistance = length(item);
    //     const arc = [];
    //     let i = 0;
    //     for (
    //       let loopCount = 0;
    //       loopCount < steps;
    //       i += lineDistance / steps
    //     ) {
    //       loopCount++;
    //       const segment = along(item, i);
    //       arc.push(segment.geometry.coordinates);
    //     }
    //     item.geometry.coordinates = arc;
    //   });

    //   // Get unique list of names
    //   let uniqueNames = geojsonArray.map((item) => {
    //     return item.properties.name;
    //   });
    //   uniqueNames = [...new Set(uniqueNames)];
    //   // For each name get an array of routes with each name
    //   // let uniqueNamesObject = {};
    //   uniqueNames.forEach((name) => {
    //     let groupedByArray = geojsonArray.filter((personRoute) => {
    //       return personRoute.properties.name === name;
    //     });

    //     // Sort by year
    //     groupedByArray.sort((a, b) => a.properties.year - b.properties.year);
    //   });
    //   geojsonArray.forEach((feature) => {
    //     reformattedRoutes.features.push(feature);
    //   });
    //   setGeom(reformattedRoutes);
    // });
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
          "circle-radius": 10,
          "circle-color": [
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
      <div id="Clock">{time}</div>
      <div id="toolbar">
        <div id="title">Family Tree Animator</div>
        <form id="form">
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
        </form>

        <button onClick={handleAddition} id="addButton">
          Add
        </button>
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
        <button type="submit" onClick={handleSubmit} id="submitButton">
          Start Animation
        </button>
      </div>
      <div id="map" ref={mapContainer} />
    </div>
  );
}

export default App;
