import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  startLoading,
  setCurrentDriver,
  driverError,
} from "../../redux/slices/driverSlice";
import { getDriverByIdAPI, getAllDriversAPI, getMyDriverAPI } from "../../services/driverService";
import { getAllOrdersAPI, updateStatusAPI, driverAcceptAPI } from "../../services/orderService";
import { setOrders } from "../../redux/slices/orderSlice";
import DriverMap from "./DriverMap";
import StatusSelector from "./StatusSelector";
import LocationTracker from "./LocationTracker";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { updateOrder } from "../../redux/slices/orderSlice";

// Backend uses: CREATED, DRIVER_ASSIGNED, DRIVER_ACCEPTED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
const orderDriverId = (order) => {
  const d = order.driver;
  if (!d) return null;
  return typeof d === "object" && d !== null ? d._id : d;
};

const customerName = (order) =>
  order.customer?.name ?? order.customerName ?? "Customer";

const pickupDisplay = (order) =>
  order.pickupAddress ||
  (order.pickupLocation?.coordinates &&
    `${order.pickupLocation.coordinates[1]?.toFixed(4)}, ${order.pickupLocation.coordinates[0]?.toFixed(4)}`) ||
  "N/A";

const deliveryDisplay = (order) =>
  order.deliveryAddress ||
  (order.dropLocation?.coordinates &&
    `${order.dropLocation.coordinates[1]?.toFixed(4)}, ${order.dropLocation.coordinates[0]?.toFixed(4)}`) ||
  "N/A";

const statusDisplay = (status) => {
  const map = {
    CREATED: "created",
    DRIVER_ASSIGNED: "assigned",
    DRIVER_ACCEPTED: "accepted",
    PICKED_UP: "picked up",
    IN_TRANSIT: "in-transit",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };
  return map[status] ?? status;
};

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { currentDriver, error: driverLoadError } = useSelector((state) => state.driver);
  const { orders } = useSelector((state) => state.order);
  const { user, role } = useSelector((state) => state.auth);

  const authUserId = localStorage.getItem("driverId") || user?.id || user?._id;
  const [effectiveDriverId, setEffectiveDriverId] = useState(authUserId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(startLoading());
        let driverData = null;

        // 1️⃣ Always try /drivers/me – now works for any authenticated user
        try {
          const myRes = await getMyDriverAPI();
          const myDriver = myRes?.data ?? myRes;
          if (myDriver && myDriver._id) {
            driverData = myDriver;
            setEffectiveDriverId(myDriver._id);
          }
        } catch (e) {
          console.error("Failed to load driver via /drivers/me:", e);
        }

        // 2️⃣ If still no driver and we have an auth id, try direct lookup by driver id
        if (!driverData && authUserId) {
          try {
            const result = await getDriverByIdAPI(authUserId);
            const direct = result?.data ?? result;
            if (direct && direct._id) {
              driverData = direct;
              setEffectiveDriverId(direct._id);
            }
          } catch (e) {
            console.error("Failed to load driver via id:", e);
          }
        }

        if (driverData) {
          dispatch(setCurrentDriver(driverData));
          setEffectiveDriverId(driverData._id);
        } else {
          // Instead of creating a fake driver (which breaks status updates),
          // surface a clear error that the driver profile is missing.
          dispatch(
            driverError(
              "Driver profile not found. Please ask admin/fleet manager to create your driver profile."
            )
          );
        }

        const ordersData = await getAllOrdersAPI();
        dispatch(setOrders(Array.isArray(ordersData) ? ordersData : []));
      } catch (err) {
        console.error("Failed to load driver data:", err);
        dispatch(
          driverError(
            "Unable to load driver data. Please refresh or contact admin."
          )
        );
      }
    };

    if (authUserId || user) {
      fetchData();
    }
  }, [dispatch, authUserId, user]);

  // Backend returns order.driver (populated object or id). Match by driver document _id.
  const assignedOrders = orders.filter((order) => {
    const oid = orderDriverId(order);
    return (
      oid &&
      (oid === effectiveDriverId ||
        oid.toString() === effectiveDriverId?.toString())
    );
  });

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      const updated = await updateStatusAPI(orderId, status);
      dispatch(updateOrder(updated?.data ?? updated));
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const updated = await driverAcceptAPI(orderId);
      dispatch(updateOrder(updated?.data ?? updated));
    } catch (err) {
      console.error("Failed to accept order:", err);
    }
  };

  if (!currentDriver) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-sm text-gray-600">
            {driverLoadError || "Loading driver data..."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {currentDriver.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Driver Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <StatusSelector />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-medium">
                  {currentDriver.vehicle?.type || "N/A"} - {currentDriver.vehicle?.registrationNumber || currentDriver.vehicle?.plate || "N/A"}
                </p>
              </div>
              {(currentDriver.liveLocation?.coordinates || currentDriver.location) && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-xs font-mono">
                    {currentDriver.liveLocation?.coordinates
                      ? `${currentDriver.liveLocation.coordinates[1]?.toFixed(4)}, ${currentDriver.liveLocation.coordinates[0]?.toFixed(4)}`
                      : `${currentDriver.location?.lat?.toFixed(4)}, ${currentDriver.location?.lng?.toFixed(4)}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customers Assigned to You ({assignedOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No customers assigned yet</p>
                  <p className="text-sm mt-2">
                    Fleet manager will assign customer orders to you. They will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedOrders.map((order) => {
                    const status = order.status;
                    return (
                      <div
                        key={order._id}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{customerName(order)}</p>
                            <p className="text-xs text-gray-500">
                              Order #{order.orderId || order._id?.slice(-8)}
                            </p>
                          </div>
                          <Badge className={
                            status === "DRIVER_ASSIGNED" || status === "DRIVER_ACCEPTED" ? "bg-blue-100 text-blue-800" :
                            status === "PICKED_UP" ? "bg-amber-100 text-amber-800" :
                            status === "IN_TRANSIT" ? "bg-purple-100 text-purple-800" :
                            status === "DELIVERED" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {statusDisplay(status)}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1 mb-3">
                          <p>
                            <span className="font-medium">Pickup:</span> {pickupDisplay(order)}
                          </p>
                          <p>
                            <span className="font-medium">Delivery:</span> {deliveryDisplay(order)}
                          </p>
                          {order.customer?.defaultLocation?.coordinates?.length >= 2 && (
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Customer location:</span>{" "}
                              {order.customer.defaultLocation.coordinates[1].toFixed(4)},{" "}
                              {order.customer.defaultLocation.coordinates[0].toFixed(4)}
                            </p>
                          )}
                        </div>
                        {status === "DRIVER_ASSIGNED" && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptOrder(order._id)}
                            className="w-full"
                          >
                            Accept Order
                          </Button>
                        )}
                        {status === "DRIVER_ACCEPTED" && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderStatusUpdate(order._id, "PICKED_UP")}
                            className="w-full"
                          >
                            Pick Up Package
                          </Button>
                        )}
                        {status === "PICKED_UP" && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderStatusUpdate(order._id, "IN_TRANSIT")}
                            className="w-full"
                          >
                            Start Delivery
                          </Button>
                        )}
                        {status === "IN_TRANSIT" && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderStatusUpdate(order._id, "DELIVERED")}
                            className="w-full bg-green-600"
                          >
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
       <div>
        You can see the Live Map from the sidebar to view your real-time location and route.
       </div>
       {/* Start watching real driver location and push to backend */}
       <LocationTracker />
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;