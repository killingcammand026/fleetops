import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllOrdersAPI } from "../../services/orderService";
import { setOrders } from "../../redux/slices/orderSlice";
import { updateStatusAPI, driverAcceptAPI } from "../../services/orderService";
import { updateOrder } from "../../redux/slices/orderSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

// Helper to normalise driver id from populated or raw field
const orderDriverId = (order) => {
  const d = order.driver;
  if (!d) return null;
  return typeof d === "object" && d !== null ? d._id : d;
};

const prettyStatus = (rawStatus) => {
  const status = (rawStatus || "").toUpperCase();
  const map = {
    CREATED: "created",
    DRIVER_ASSIGNED: "assigned",
    DRIVER_ACCEPTED: "accepted",
    PICKED_UP: "picked up",
    IN_TRANSIT: "in transit",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };
  return map[status] || rawStatus || "unknown";
};

const badgeClasses = (rawStatus) => {
  const status = (rawStatus || "").toUpperCase();
  if (status === "DRIVER_ASSIGNED" || status === "DRIVER_ACCEPTED") {
    return "bg-blue-100 text-blue-800";
  }
  if (status === "PICKED_UP") {
    return "bg-amber-100 text-amber-800";
  }
  if (status === "IN_TRANSIT") {
    return "bg-purple-100 text-purple-800";
  }
  if (status === "DELIVERED") {
    return "bg-green-100 text-green-800";
  }
  if (status === "CANCELLED") {
    return "bg-red-100 text-red-800";
  }
  return "bg-gray-100 text-gray-800";
};

const DriverOrders = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const driverId = localStorage.getItem("driverId") || user?.id || user?._id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getAllOrdersAPI();
        dispatch(setOrders(ordersData));
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    };
    fetchOrders();
    // Refresh every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const safeOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders]
  );

  // Get assigned orders using populated driver reference
  const assignedOrders = safeOrders.filter((order) => {
    const oid = orderDriverId(order);
    return (
      oid &&
      driverId &&
      (oid === driverId || oid.toString() === driverId.toString())
    );
  });

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const updated = await updateStatusAPI(orderId, status);
      dispatch(updateOrder(updated?.data ?? updated));
    } catch (err) {
      console.error("Failed to update order:", err);
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage your assigned delivery orders
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Assigned Orders ({assignedOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No assigned orders</p>
                <p className="text-sm mt-2">
                  Orders will appear here when assigned by fleet manager
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">
                          {order.customerName || "Customer"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <Badge className={badgeClasses(order.status)}>
                        {prettyStatus(order.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div>
                        <span className="font-medium">Pickup:</span>{" "}
                        {order.pickupAddress}
                      </div>
                      <div>
                        <span className="font-medium">Delivery:</span>{" "}
                        {order.deliveryAddress}
                      </div>
                      {order.priority && (
                        <div>
                          <span className="font-medium">Priority:</span>{" "}
                          <span className="uppercase">{order.priority}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {order.status === "DRIVER_ASSIGNED" && (
                        <Button
                          onClick={() => handleAcceptOrder(order._id)}
                          className="flex-1"
                        >
                          Accept Order
                        </Button>
                      )}
                      {order.status === "DRIVER_ACCEPTED" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(order._id, "PICKED_UP")
                          }
                          className="flex-1"
                        >
                          Pick Up Package
                        </Button>
                      )}
                      {order.status === "PICKED_UP" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(order._id, "IN_TRANSIT")
                          }
                          className="flex-1"
                        >
                          Start Delivery
                        </Button>
                      )}
                      {order.status === "IN_TRANSIT" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(order._id, "DELIVERED")
                          }
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      {order.status === "DELIVERED" && (
                        <div className="w-full p-2 bg-green-50 rounded text-green-700 text-center text-sm">
                          ✓ Order Delivered
                        </div>
                      )}
                    </div>
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

export default DriverOrders;