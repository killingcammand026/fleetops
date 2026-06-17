import { useSelector, useDispatch } from "react-redux";
import AssignDriverForm from "../../pages/fleet/AssignDriverForm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { getAllOrdersAPI } from "../../services/orderService";
import { getAllDriversAPI } from "../../services/driverService";
import { setOrders } from "../../redux/slices/orderSlice";
import { setDrivers } from "../../redux/slices/driverSlice";

// Backend: CREATED, DRIVER_ASSIGNED, DRIVER_ACCEPTED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
const orderDriverId = (order) => {
  const d = order.driver;
  if (!d) return null;
  return typeof d === "object" && d !== null ? d._id : d;
};

const FleetOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.order?.orders) || [];
  const drivers = useSelector((state) => state.driver?.drivers) || [];
  const user = useSelector((state) => state.auth?.user);
  const [highlightedOrder, setHighlightedOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ordersData = await getAllOrdersAPI();
        dispatch(setOrders(Array.isArray(ordersData) ? ordersData : []));
        const driversRes = await getAllDriversAPI();
        const driversList = Array.isArray(driversRes?.data) ? driversRes.data : (Array.isArray(driversRes) ? driversRes : []);
        dispatch(setDrivers(driversList));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [dispatch]);

  const myOrders = orders.length > 0
    ? orders.filter((order) => !order.fleetManagerId || order.fleetManagerId === user?._id)
    : orders;

  const sortedOrders = [...myOrders].sort((a, b) => {
    if (a.status === "CREATED" && b.status !== "CREATED") return -1;
    if (a.status !== "CREATED" && b.status === "CREATED") return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const pendingOrders = sortedOrders.filter((o) => o.status === "CREATED");
  const activeOrders = sortedOrders.filter((o) =>
    ["DRIVER_ASSIGNED", "DRIVER_ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(o.status)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED":
        return "bg-yellow-100 text-yellow-800";
      case "DRIVER_ASSIGNED":
      case "DRIVER_ACCEPTED":
      case "PICKED_UP":
        return "bg-blue-100 text-blue-800";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAssignedDriver = (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    const driverId = order ? orderDriverId(order) : null;
    if (!driverId) return null;
    return drivers.find((d) => d._id === driverId || d._id?.toString() === driverId?.toString());
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Orders Management</CardTitle>
          <div className="flex gap-2">
            {pendingOrders.length > 0 && (
              <Badge className="bg-yellow-500 text-white animate-pulse">
                {pendingOrders.length} Pending
              </Badge>
            )}
            {activeOrders.length > 0 && (
              <Badge className="bg-blue-500 text-white">
                {activeOrders.length} Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-sm mt-2">Orders will appear here when customers create them</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {pendingOrders.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <span>⏳</span> Pending Assignment ({pendingOrders.length})
                </h3>
                <div className="space-y-3">
                  {pendingOrders.map((order) => {
              const assignedDriver = getAssignedDriver(order._id);

                    return (
                      <div
                        key={order._id}
                        className={`border-2 rounded-lg p-4 bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                          highlightedOrder === order._id
                            ? "border-yellow-400 shadow-lg ring-2 ring-yellow-200"
                            : "border-yellow-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {order.customer?.name ?? order.customerName ?? "Customer"}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Order #{order._id.slice(-8).toUpperCase()} •{" "}
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex items-start">
                            <span className="font-medium text-gray-700 min-w-[80px]">Pickup:</span>
                            <span className="text-gray-600">{order.pickupAddress || (order.pickupLocation?.coordinates && `Lat ${order.pickupLocation.coordinates[1]?.toFixed(4)}, Lng ${order.pickupLocation.coordinates[0]?.toFixed(4)}`) || "N/A"}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-medium text-gray-700 min-w-[80px]">Delivery:</span>
                            <span className="text-gray-600">{order.deliveryAddress || (order.dropLocation?.coordinates && `Lat ${order.dropLocation.coordinates[1]?.toFixed(4)}, Lng ${order.dropLocation.coordinates[0]?.toFixed(4)}`) || "N/A"}</span>
                          </div>
                          {order.priority && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">Priority:</span>
                              <Badge
                                className={
                                  order.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : order.priority === "normal"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {order.priority.toUpperCase()}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {assignedDriver ? (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-900">
                              ✓ Driver Assigned
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              {assignedDriver.name} • {assignedDriver.vehicle?.type} -{" "}
                              {assignedDriver.vehicle?.registrationNumber || assignedDriver.vehicle?.plate}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <AssignDriverForm orderId={order._id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeOrders.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <span>🚚</span> Active Deliveries ({activeOrders.length})
                </h3>
                <div className="space-y-3">
                  {activeOrders.map((order) => {
                    const assignedDriver = getAssignedDriver(order._id);
                    return (
                      <div
                        key={order._id}
                        className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow border-blue-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{order.customer?.name ?? order.customerName ?? "Customer"}</h4>
                            <p className="text-xs text-gray-500">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="font-medium">From:</span> {order.pickupAddress || (order.pickupLocation?.coordinates && `Lat ${order.pickupLocation.coordinates[1]?.toFixed(4)}, Lng ${order.pickupLocation.coordinates[0]?.toFixed(4)}`) || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">To:</span> {order.deliveryAddress || (order.dropLocation?.coordinates && `Lat ${order.dropLocation.coordinates[1]?.toFixed(4)}, Lng ${order.dropLocation.coordinates[0]?.toFixed(4)}`) || "N/A"}
                          </p>
                        </div>
                        {assignedDriver && (
                          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm">
                              <span className="font-medium">Driver:</span> {assignedDriver.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {assignedDriver.vehicle?.type} - {assignedDriver.vehicle?.registrationNumber || assignedDriver.vehicle?.plate}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FleetOrders;