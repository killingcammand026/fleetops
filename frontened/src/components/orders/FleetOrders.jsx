import { useSelector } from "react-redux";
import AssignDriverForm from "../../pages/fleet/AssignDriverForm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";

const FleetOrders = () => {
  const { orders } = useSelector((state) => state.order);
  const { drivers } = useSelector((state) => state.driver);
  const { user } = useSelector((state) => state.auth);
  const [highlightedOrder, setHighlightedOrder] = useState(null);

 
  const myOrders = orders.length > 0 
    ? orders.filter((order) => !order.fleetManagerId || order.fleetManagerId === user?._id)
    : orders;

  
  const sortedOrders = [...myOrders].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const pendingOrders = sortedOrders.filter((o) => o.status === "pending");
  const activeOrders = sortedOrders.filter((o) => o.status === "assigned" || o.status === "in-transit");

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in-transit":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAssignedDriver = (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order?.assignedDriverId) return null;
    return drivers.find((d) => d._id === order.assignedDriverId);
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
                              {order.customerName || "Customer"}
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
                            <span className="text-gray-600">{order.pickupAddress}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-medium text-gray-700 min-w-[80px]">Delivery:</span>
                            <span className="text-gray-600">{order.deliveryAddress}</span>
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
                              {assignedDriver.vehicle?.plate}
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
                            <h4 className="font-semibold">{order.customerName || "Customer"}</h4>
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
                            <span className="font-medium">From:</span> {order.pickupAddress}
                          </p>
                          <p>
                            <span className="font-medium">To:</span> {order.deliveryAddress}
                          </p>
                        </div>
                        {assignedDriver && (
                          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm">
                              <span className="font-medium">Driver:</span> {assignedDriver.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {assignedDriver.vehicle?.type} - {assignedDriver.vehicle?.plate}
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
