import React, { useEffect, useRef } from "react";
import { map, setupMapInteractions } from "../openlayers/map";

const MapContainer = () => {
  const mapElementRef = useRef(null);

  useEffect(() => {
    if (mapElementRef.current) {
      map.setTarget(mapElementRef.current);
      setupMapInteractions?.();
    }
    return () => {
      map.setTarget(null);
    };
  }, []);

  return (
    <div
      id="map"
      ref={mapElementRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};

export default MapContainer;
