import React from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import scooterIcon from "../../assets/scooter.png";

const scooterIconInstance = new L.Icon({
  iconUrl: scooterIcon,
  iconSize: [40, 40],
});

const DriverMap = () => {
  const { currentDriver } = useSelector((state) => state.driver);

  if (!currentDriver?.liveLocation) return null;

  const [lng, lat] = currentDriver.liveLocation.coordinates;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      style={{ width: "100%", height: "400px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[lat, lng]} icon={scooterIconInstance} />
    </MapContainer>
  );
};

export default DriverMap;




// import React from "react";
// import { useSelector } from "react-redux";
// import {
//   GoogleMap,
//   Marker,
//   useLoadScript,
// } from "@react-google-maps/api";

// import L from "leaflet";
// import scooterIcon from "../../assets/scooter.png";
// import "leaflet/dist/leaflet.css";
// import homeIcon from "../../assets/home.png";


// import Map from "../../components/Map";

// const scooterIconInstance = new L.Icon({
//   iconUrl: scooterIcon,
//   iconSize: [40, 40],
// });

// const homeIconInstance = new L.Icon({
//   iconUrl: homeIcon,
//   iconSize: [40, 40],
// });



// const DriverMap = () => {
//   const { currentDriver } = useSelector(
//     (state) => state.driver
//   );


//     const { isLoaded } = useLoadScript({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
//   });


  
//   if (!isLoaded) return <div>Loading Map...</div>;
//   if (!currentDriver?.liveLocation) return null;


//     const [lng, lat] =
//     currentDriver.liveLocation.coordinates;


//     return (
//     <GoogleMap
//       center={{ lat, lng }}
//       zoom={14}
//       mapContainerStyle={{ width: "100%", height: "400px" }}
//     >
//       <Marker position={{ lat, lng }} />
//     </GoogleMap>
//   );
// };

// export default DriverMap;