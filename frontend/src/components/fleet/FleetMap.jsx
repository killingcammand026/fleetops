import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllDriversAPI } from "../../services/driverService.js";
import { setDrivers } from "../../redux/slices/driverSlice.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import scooterIcon from "../../assets/scooter.png";

const driverIcon = new L.Icon({
  iconUrl: scooterIcon,
  iconSize: [35, 35],
});

const FleetMap = () => {
  const dispatch = useDispatch();
  const drivers = useSelector((state) => state.driver?.drivers) || [];
  const orders = useSelector((state) => state.order?.orders) || [];

  const [center] = useState([28.6139, 77.2090]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const result = await getAllDriversAPI();
        if (result?.data) {
          dispatch(setDrivers(result.data));
        }
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
      }
    };

    fetchDrivers();
    const interval = setInterval(fetchDrivers, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const getDriverOrder = (driverId) => {
    return orders.find((o) => {
      const d = o.driver;
      const id = typeof d === "object" ? d?._id : d;
      return id?.toString() === driverId?.toString();
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-4">
        Live Fleet Map ({drivers.length} active)
      </h3>

      <MapContainer
        center={center}
        zoom={12}
        style={{ width: "100%", height: "500px", borderRadius: "8px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {drivers.map((driver) => {
          const lat =
            driver.liveLocation?.coordinates?.[1] ??
            driver.location?.lat;
          const lng =
            driver.liveLocation?.coordinates?.[0] ??
            driver.location?.lng;

          if (lat == null || lng == null) return null;

          const order = getDriverOrder(driver._id);

          return (
            <Marker
              key={driver._id}
              position={[lat, lng]}
              icon={driverIcon}
            >
              <Popup>
                <div>
                  <p className="font-semibold">{driver.name}</p>
                  <p>Status: {driver.status}</p>
                  {order && (
                    <p className="text-sm">
                      Order: {order.customer?.name ?? "Customer"}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default FleetMap;















// // Fleet Map - Shows all active drivers on a map
// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { getAllDriversAPI } from "../../services/driverService";
// import { setDrivers } from "../../redux/slices/driverSlice";
// import { GoogleMap, Marker, useLoadScript, InfoWindow } from "@react-google-maps/api";

// const FleetMap = () => {
//   const dispatch = useDispatch();
// const drivers = useSelector((state) => state.driver?.drivers) || [];
// const orders = useSelector((state) => state.order?.orders) || [];
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi center

//   const { isLoaded } = useLoadScript({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
//   });

//   useEffect(() => {
//     const fetchDrivers = async () => {
//       try {
//         const result = await getAllDriversAPI();
//         if (result?.data) {
//           dispatch(setDrivers(result.data));
//         }
//       } catch (err) {
//         console.error("Failed to fetch drivers:", err);
//       }
//     };

//     fetchDrivers();
//     // Refresh driver locations every 5 seconds
//     const interval = setInterval(fetchDrivers, 5000);
//     return () => clearInterval(interval);
//   }, [dispatch]);

//   // Get status color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "available":
//         return "green";
//       case "on-route":
//         return "blue";
//       case "busy":
//         return "orange";
//       case "offline":
//         return "gray";
//       default:
//         return "red";
//     }
//   };

//   const orderDriverId = (order) => {
//     const d = order.driver;
//     if (!d) return null;
//     return typeof d === "object" && d !== null ? d._id : d;
//   };
//   const getDriverOrder = (driverId) => {
//     return orders.find((o) => {
//       const oid = orderDriverId(o);
//       return oid && (oid === driverId || oid.toString() === driverId?.toString());
//     });
//   };

//   if (!isLoaded && import.meta.env.VITE_GOOGLE_MAPS_KEY) {
//     return (
//       <div className="p-4 border rounded-lg">
//         <p className="text-gray-600">Loading Map...</p>
//         <p className="text-sm text-gray-500 mt-2">
//           {drivers.length} active drivers
//         </p>
//       </div>
//     );
//   }

//   // Fallback if no Google Maps API key
//   if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
//     return (
//       <div className="p-4 border rounded-lg bg-gray-50">
//         <h3 className="font-semibold mb-4">Active Drivers ({drivers.length})</h3>
//         <div className="space-y-2">
//           {drivers.map((driver) => {
//             const order = getDriverOrder(driver._id);
//             return (
//               <div
//                 key={driver._id}
//                 className="p-3 border rounded bg-white"
//               >
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="font-medium">{driver.name}</p>
//                     <p className="text-sm text-gray-600">
//                       {driver.vehicle?.type} - {driver.vehicle?.registrationNumber || driver.vehicle?.plate}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       Status: <span className={`font-semibold text-${getStatusColor(driver.status?.toLowerCase?.() || driver.status)}-600`}>
//                         {driver.status}
//                       </span>
//                     </p>
//                     {order && (
//                       <p className="text-xs text-blue-600 mt-1">
//                         Order: {order.customer?.name ?? order.customerName ?? "Customer"} → {order.deliveryAddress || (order.dropLocation?.coordinates && `Lat ${order.dropLocation.coordinates[1]?.toFixed(2)}, Lng ${order.dropLocation.coordinates[0]?.toFixed(2)}`) || "N/A"}
//                       </p>
//                     )}
//                   </div>
//                   {driver.location && (
//                     <div className="text-xs text-gray-500">
//                       <p>📍 {driver.location.lat.toFixed(4)}, {driver.location.lng.toFixed(4)}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//         {drivers.length === 0 && (
//           <p className="text-gray-500 text-center py-4">No active drivers</p>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 border rounded-lg">
//       <h3 className="font-semibold mb-4">
//         Live Fleet Map ({drivers.filter((d) => d.status !== "offline").length} active)
//       </h3>
//       <GoogleMap
//         center={center}
//         zoom={12}
//         mapContainerStyle={{ width: "100%", height: "500px", borderRadius: "8px" }}
//       >
//         {drivers
//           .filter((driver) => {
//             const coords = driver.liveLocation?.coordinates || driver.location;
//             return (coords && (Array.isArray(coords) ? coords.length >= 2 : (driver.location?.lat != null))) && driver.status !== "Offline" && driver.status !== "offline";
//           })
//           .map((driver) => {
//             const order = getDriverOrder(driver._id);
//             const lat = driver.liveLocation?.coordinates?.[1] ?? driver.location?.lat;
//             const lng = driver.liveLocation?.coordinates?.[0] ?? driver.location?.lng;
//             if (lat == null || lng == null) return null;
//             return (
//               <Marker
//                 key={driver._id}
//                 position={{ lat, lng }}
//                 icon={{
//                   path: window.google?.maps?.SymbolPath?.CIRCLE || "",
//                   scale: 8,
//                   fillColor: getStatusColor(driver.status?.toLowerCase?.() || driver.status),
//                   fillOpacity: 1,
//                   strokeColor: "#fff",
//                   strokeWeight: 2,
//                 }}
//                 onClick={() => setSelectedDriver(driver)}
//               >
//                 {selectedDriver?._id === driver._id && (
//                   <InfoWindow
//                     position={{ lat, lng }}
//                     onCloseClick={() => setSelectedDriver(null)}
//                   >
//                     <div className="p-2">
//                       <p className="font-semibold">{driver.name}</p>
//                       <p className="text-sm">{driver.vehicle?.type} - {driver.vehicle?.registrationNumber || driver.vehicle?.plate}</p>
//                       <p className="text-xs">Status: {driver.status}</p>
//                       {order && (
//                         <>
//                           <p className="text-xs mt-1 text-blue-600">
//                             Order: {order.customer?.name ?? order.customerName ?? "Customer"}
//                           </p>
//                           <p className="text-xs text-gray-600">
//                             To: {order.deliveryAddress || (order.dropLocation?.coordinates && `Lat ${order.dropLocation.coordinates[1]?.toFixed(2)}, Lng ${order.dropLocation.coordinates[0]?.toFixed(2)}`) || "N/A"}
//                           </p>
//                         </>
//                       )}
//                     </div>
//                   </InfoWindow>
//                 )}
//               </Marker>
//             );
//           })}
//       </GoogleMap>
//     </div>
//   );
// };

// export default FleetMap;