import "./App.css";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { along, length } from "@turf/turf";
import { exampleGeojson, point } from "./exampleGeojson";
import maplibreGl from "maplibre-gl";

function App() {
  const [year, setYear] = useState(1995);
  const timerRef = useRef();


const routes = {1:1996,2:1999,3:2005,4:2005}

const animate = () => {
  for(let i=0; i< 1000000; i++){
    console.log(i)
  }
}

  const refreshYear = () => {
    setYear((year) => {
      return year + 1;
    });
  };
  useEffect(() => {
    timerRef.current = setInterval(refreshYear, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (Object.values(routes).includes(year)) {
      clearInterval(timerRef.current);
      console.log(year)
      // animate()
      timerRef.current = setInterval(refreshYear, 1000);
    }
  }, [year]);

  return <div>{year}</div>;
}

export default App;
