import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const Map = () => {
  return (
    <MapContainer
      center={[22.8046, 86.2029]}  // Jamshedpur
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[22.8046, 86.2029]}>
        <Popup>Driver Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;