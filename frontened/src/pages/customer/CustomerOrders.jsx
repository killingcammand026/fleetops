import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllOrdersAPI } from "../../services/orderService";
import { setOrders } from "../../redux/slices/orderSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import useOrderSocket from "../../hooks/useOrderSocket";

const CustomerOrders = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  // Enable real-time socket updates
  const userId = user?._id || user?.id;
  useOrderSocket(userId);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getAllOrdersAPI();
        dispatch(setOrders(Array.isArray(ordersData) ? ordersData : []));
      } catch (err) {
        console.error("Failed to load orders:", err);
        dispatch(setOrders([]));
      }
    };
    fetchOrders();
  }, [dispatch]);

  const safeOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders]
  );

  // Status badge color helper
  const getStatusBadgeColor = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "CREATED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DRIVER_ASSIGNED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DRIVER_ACCEPTED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "PICKED_UP":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "IN_TRANSIT":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    const s = (status || "").toUpperCase();
    const statusMap = {
      "CREATED": "📋 Created",
      "DRIVER_ASSIGNED": "👤 Driver Assigned",
      "DRIVER_ACCEPTED": "✅ Driver Accepted",
      "PICKED_UP": "📦 Picked Up",
      "IN_TRANSIT": "🚚 In Transit",
      "DELIVERED": "✨ Delivered",
      "CANCELLED": "❌ Cancelled"
    };
    return statusMap[s] || status || "Unknown";
  };

  const myOrders = safeOrders.filter((order) => {
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

    const userId = user?._id || user?.id;
    return customerId && userId && customerId.toString() === userId.toString();
  });

  // Sort orders: active first, then by date
  const sortedOrders = [...myOrders].sort((a, b) => {
    const statusPriority = {
      "CREATED": 1,
      "DRIVER_ASSIGNED": 2,
      "DRIVER_ACCEPTED": 3,
      "PICKED_UP": 4,
      "IN_TRANSIT": 5,
      "DELIVERED": 6,
      "CANCELLED": 7
    };
    
    const priorityA = statusPriority[a.status?.toUpperCase()] || 99;
    const priorityB = statusPriority[b.status?.toUpperCase()] || 99;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-gray-600 mt-1">
              Track and manage all your orders in real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order History ({sortedOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No orders yet</p>
                <p className="text-sm mt-2">
                  Go to Dashboard to create your first order
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">
                          Order #{order.orderId || order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">📍</span>
                        <div>
                          <span className="font-medium">Pickup:</span>{" "}
                          {order.pickupAddress ||
                            (order.pickupLocation?.coordinates &&
                              `Lat ${order.pickupLocation.coordinates[1]?.toFixed(
                                4
                              )}, Lng ${order.pickupLocation.coordinates[0]?.toFixed(
                                4
                              )}`) ||
                            "N/A"}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">🎯</span>
                        <div>
                          <span className="font-medium">Drop:</span>{" "}
                          {order.dropAddress ||
                            (order.dropLocation?.coordinates &&
                              `Lat ${order.dropLocation.coordinates[1]?.toFixed(
                                4
                              )}, Lng ${order.dropLocation.coordinates[0]?.toFixed(
                                4
                              )}`) ||
                            "N/A"}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <span>💰</span>
                          <span className="font-medium">
                            ₹{order.estimateFare?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📏</span>
                          <span>
                            {order.distanceKm?.toFixed(2) || "N/A"} km
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>💳</span>
                          <span>
                            {order.payment?.method || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Driver Assignment Status */}
                    {order.driver && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          👤 Driver Assigned
                        </p>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {order.driver.name || "Not specified"}
                          </p>
                          {order.driver.vehicleNumber && (
                            <p>
                              <span className="font-medium">Vehicle:</span>{" "}
                              {order.driver.vehicleNumber}
                            </p>
                          )}
                          {order.driver.phone && (
                            <p>
                              <span className="font-medium">Phone:</span>{" "}
                              <a href={`tel:${order.driver.phone}`} className="hover:underline">
                                {order.driver.phone}
                              </a>
                            </p>
                          )}
                          {order.status === "DRIVER_ASSIGNED" && (
                            <p className="text-xs text-blue-600 mt-1">
                              ⏳ Waiting for driver to accept the order...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Status Progress */}
                    {order.status && order.status !== "CREATED" && order.status !== "CANCELLED" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Order Progress</span>
                          <span>{formatStatus(order.status)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(() => {
                                const progress = {
                                  "DRIVER_ASSIGNED": 25,
                                  "DRIVER_ACCEPTED": 40,
                                  "PICKED_UP": 60,
                                  "IN_TRANSIT": 80,
                                  "DELIVERED": 100
                                };
                                return progress[order.status?.toUpperCase()] || 0;
                              })()}%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {order.deliveredAt && (
                      <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs text-green-600">
                          ✅ Delivered on {new Date(order.deliveredAt).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {order.status === "CANCELLED" && (
                      <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs text-red-600">
                          ❌ Order cancelled
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerOrders;