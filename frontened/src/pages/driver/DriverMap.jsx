import React from "react";
import { useSelector } from "react-redux";
import {
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";


const DriverMap = () => {
  const { currentDriver } = useSelector(
    (state) => state.driver
  );


    const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });


  
  if (!isLoaded) return <div>Loading Map...</div>;
  if (!currentDriver?.liveLocation) return null;


    const [lng, lat] =
    currentDriver.liveLocation.coordinates;


    return (
    <GoogleMap
      center={{ lat, lng }}
      zoom={14}
      mapContainerStyle={{ width: "100%", height: "400px" }}
    >
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  );
};

export default DriverMap;