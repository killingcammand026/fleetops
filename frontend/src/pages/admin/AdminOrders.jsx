import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { setOrders } from "../../redux/slices/orderSlice";
import { getAllOrdersAPI } from "../../services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);

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

  const getStatusColor = (rawStatus) => {
    const status = (rawStatus || "").toUpperCase();
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

  const prettyStatus = (rawStatus) => {
    const status = (rawStatus || "").toUpperCase();
    const map = {
      CREATED: "Created",
      DRIVER_ASSIGNED: "Driver Assigned",
      DRIVER_ACCEPTED: "Driver Accepted",
      PICKED_UP: "Picked Up",
      IN_TRANSIT: "In Transit",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };
    return map[status] || rawStatus || "Unknown";
  };

  const safeOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders]
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Orders</h1>
          <p className="text-gray-600 mt-1">Monitor all orders in the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Orders ({safeOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safeOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeOrders
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                  )
                  .map((order) => {
                    const customerName =
                      order.customer?.name ||
                      order.customerName ||
                      "Customer";
                    const driverName =
                      order.driver?.name || order.driverName || "Not assigned";
                    const pickup =
                      order.pickupAddress ||
                      (order.pickupLocation?.coordinates &&
                        `Lat ${order.pickupLocation.coordinates[1]?.toFixed(
                          4
                        )}, Lng ${order.pickupLocation.coordinates[0]?.toFixed(
                          4
                        )}`) ||
                      "N/A";
                    const delivery =
                      order.deliveryAddress ||
                      (order.dropLocation?.coordinates &&
                        `Lat ${order.dropLocation.coordinates[1]?.toFixed(
                          4
                        )}, Lng ${order.dropLocation.coordinates[0]?.toFixed(
                          4
                        )}`) ||
                      "N/A";

                    return (
                      <div
                        key={order._id}
                        className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">{customerName}</p>
                            <p className="text-sm text-gray-500">
                              Order #
                              {order.orderId ||
                                order._id?.slice(-8).toUpperCase()}{" "}
                              •{" "}
                              {order.createdAt
                                ? new Date(
                                    order.createdAt
                                  ).toLocaleString()
                                : "—"}
                            </p>
                            {order.deliveredAt && (
                              <p className="text-xs text-green-700 mt-1">
                                Delivered on{" "}
                                {new Date(
                                  order.deliveredAt
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {prettyStatus(order.status)}
                          </Badge>
                        </div>

                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">From:</span>{" "}
                            {pickup}
                          </div>
                          <div>
                            <span className="font-medium">To:</span> {delivery}
                          </div>
                          <div className="mt-2">
                            <span className="font-medium">Driver:</span>{" "}
                            {driverName}
                            {order.driver?.phone && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({order.driver.phone})
                              </span>
                            )}
                          </div>
                          {order.payment && (
                            <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                              <div>
                                <span className="font-medium">
                                  Payment:
                                </span>{" "}
                                {order.payment.method} •{" "}
                                {order.payment.currency || "INR"}{" "}
                                {order.payment.amount}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Payment Status:
                                </span>{" "}
                                {order.payment.status}
                                {order.payment.paidAt && (
                                  <span>
                                    {" "}
                                    • Paid on{" "}
                                    {new Date(
                                      order.payment.paidAt
                                    ).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;