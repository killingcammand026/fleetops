import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  startLoading,
  setCurrentDriver,
  driverError,
} from "../../redux/slices/driverSlice";
import { getDriverByIdAPI, getAllDriversAPI } from "../../services/driverService";
import { getAllOrdersAPI } from "../../services/orderService";
import { setOrders } from "../../redux/slices/orderSlice";
import DriverMap from "./DriverMap";
import StatusSelector from "./StatusSelector";
import LocationTracker from "./LocationTracker";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { updateStatusAPI } from "../../services/orderService";
import { updateOrder } from "../../redux/slices/orderSlice";

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { currentDriver } = useSelector((state) => state.driver);
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const authUserId = localStorage.getItem("driverId") || user?.id || user?._id;
  const [effectiveDriverId, setEffectiveDriverId] = useState(authUserId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(startLoading());
        let driverData = null;

        // Try by auth user ID first
        if (authUserId) {
          const result = await getDriverByIdAPI(authUserId);
          driverData = result?.data ?? result;
        }

        // If not found, try matching by email (driver added by fleet manager)
        if (!driverData && user?.email) {
          const driversRes = await getAllDriversAPI();
          const drivers = driversRes?.data ?? driversRes;
          const driversList = Array.isArray(drivers) ? drivers : [];
          const byEmail = driversList.find(
            (d) => d.email?.toLowerCase() === user.email?.toLowerCase()
          );
          if (byEmail) {
            driverData = byEmail;
            setEffectiveDriverId(byEmail._id);
          }
        }

        if (driverData) {
          dispatch(setCurrentDriver(driverData));
          setEffectiveDriverId(driverData._id);
        } else if (user) {
          // Fallback: mock driver from auth user
          const mockDriver = {
            _id: authUserId,
            name: user.name,
            email: user.email,
            status: "available",
            vehicle: { type: "Van", plate: "ABC-123" },
            location: { lat: 28.6139, lng: 77.2090 },
            isActive: true,
          };
          dispatch(setCurrentDriver(mockDriver));
          setEffectiveDriverId(authUserId);
        }

        const ordersData = await getAllOrdersAPI();
        dispatch(setOrders(ordersData));
      } catch (err) {
        console.error("Failed to load driver data:", err);
        if (user) {
          const mockDriver = {
            _id: authUserId,
            name: user.name,
            email: user.email,
            status: "available",
            vehicle: { type: "Van", plate: "ABC-123" },
            location: { lat: 28.6139, lng: 77.2090 },
            isActive: true,
          };
          dispatch(setCurrentDriver(mockDriver));
          setEffectiveDriverId(authUserId);
        }
      }
    };

    if (authUserId || user) {
      fetchData();
    }
  }, [dispatch, authUserId, user]);

  // Orders assigned to this driver (match by driver ID or auth user ID)
  const assignedOrders = orders.filter(
    (order) =>
      order.assignedDriverId === effectiveDriverId ||
      order.assignedDriverId === authUserId
  );

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      const updated = await updateStatusAPI(orderId, status);
      dispatch(updateOrder(updated));
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  if (!currentDriver) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div>Loading driver data...</div>
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
                  {currentDriver.vehicle?.type || "N/A"} - {currentDriver.vehicle?.plate || "N/A"}
                </p>
              </div>
              {currentDriver.location && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-xs font-mono">
                    {currentDriver.location.lat.toFixed(4)}, {currentDriver.location.lng.toFixed(4)}
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
                  {assignedOrders.map((order) => (
                    <div
                      key={order._id}
                      className="border rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-gray-500">
                            Order #{order._id.slice(-6)}
                          </p>
                        </div>
                        <Badge className={
                          order.status === "assigned" ? "bg-blue-100 text-blue-800" :
                          order.status === "in-transit" ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        }>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1 mb-3">
                        <p>
                          <span className="font-medium">Pickup:</span> {order.pickupAddress}
                        </p>
                        <p>
                          <span className="font-medium">Delivery:</span> {order.deliveryAddress}
                        </p>
                      </div>
                      {order.status === "assigned" && (
                        <Button
                          size="sm"
                          onClick={() => handleOrderStatusUpdate(order._id, "in-transit")}
                          className="w-full"
                        >
                          Start Delivery
                        </Button>
                      )}
                      {order.status === "in-transit" && (
                        <Button
                          size="sm"
                          onClick={() => handleOrderStatusUpdate(order._id, "delivered")}
                          className="w-full bg-green-600"
                        >
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DriverMap />
        <LocationTracker />
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;

