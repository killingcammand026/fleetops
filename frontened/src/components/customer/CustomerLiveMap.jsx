import React from "react";
import { useSelector } from "react-redux";
import {
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";

const CustomerLiveMap = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentCustomer } = useSelector((state) => state.customer);
  const orders = useSelector((state) => state.order.orders) || [];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
  });

  if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
    return (
      <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-sm text-gray-600">
        Google Maps key (`VITE_GOOGLE_MAPS_KEY`) is not configured. Live map is
        disabled.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm text-sm text-gray-600">
        Loading live map...
      </div>
    );
  }

  const userId = user?._id || user?.id;
  const myOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const customerRef = order.customer;
        const customerFromRef =
          customerRef && typeof customerRef === "object"
            ? customerRef.userId || customerRef._id
            : null;
        const customerId =
          customerFromRef ||
          order.customerId ||
          order.customer ||
          order.customerId?._id;
        return (
          customerId &&
          userId &&
          customerId.toString() === userId.toString()
        );
      })
    : [];

  const activeOrders = myOrders.filter((o) => {
    const s = (o.status || "").toUpperCase();
    return (
      s === "DRIVER_ASSIGNED" ||
      s === "DRIVER_ACCEPTED" ||
      s === "PICKED_UP" ||
      s === "IN_TRANSIT"
    );
  });

  const customerCoords =
    currentCustomer?.defaultLocation?.coordinates &&
    currentCustomer.defaultLocation.coordinates.length >= 2
      ? {
          lng: currentCustomer.defaultLocation.coordinates[0],
          lat: currentCustomer.defaultLocation.coordinates[1],
        }
      : null;

  const firstOrderWithPickup = activeOrders.find(
    (o) => o.pickupLocation?.coordinates?.length >= 2
  );

  const defaultCenter =
    customerCoords ||
    (firstOrderWithPickup && {
      lng: firstOrderWithPickup.pickupLocation.coordinates[0],
      lat: firstOrderWithPickup.pickupLocation.coordinates[1],
    }) || { lat: 28.6139, lng: 77.209 };

  return (
    <div className="mt-6 border rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Live Map – You & Assigned Drivers
          </p>
          <p className="text-xs text-gray-500">
            This map updates automatically as your location and driver locations
            change.
          </p>
        </div>
      </div>
      <div className="h-[360px]">
        <GoogleMap
          center={defaultCenter}
          zoom={13}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {customerCoords && (
            <Marker
              position={customerCoords}
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE || "",
                scale: 8,
                fillColor: "#2563eb",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          )}

          {activeOrders.map((order) => {
            const driver = order.driver;
            const coords =
              driver?.liveLocation?.coordinates &&
              driver.liveLocation.coordinates.length >= 2
                ? {
                    lng: driver.liveLocation.coordinates[0],
                    lat: driver.liveLocation.coordinates[1],
                  }
                : null;

            if (!coords) return null;

            return (
              <Marker
                key={order._id}
                position={coords}
                icon={{
                  path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW || "",
                  scale: 5,
                  fillColor: "#16a34a",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 1.5,
                }}
              />
            );
          })}
        </GoogleMap>
      </div>
    </div>
  );
};

export default CustomerLiveMap;