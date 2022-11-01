import { along, length } from "@turf/turf";

export const handleSubmit = async (stagedData) => {
    // tableDataToLineGeojson(stagedData)
    // .then((newData) => {
    //   console.log(newData);
    //   setGeom(newData);
    // });
    let yearsArray = stagedData.map((item) => {
      return item.year;
    });

    let distinctYears = [...new Set(yearsArray)];
    let earliestYear = Math.min(...distinctYears);
    let latestYear = Math.max(...distinctYears);

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
        console.log(reformattedRoutes);
        // setGeom(reformattedRoutes);
        return reformattedRoutes
      });
  };