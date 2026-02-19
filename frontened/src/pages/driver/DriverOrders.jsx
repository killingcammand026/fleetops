import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllOrdersAPI } from "../../services/orderService";
import { setOrders } from "../../redux/slices/orderSlice";
import { updateStatusAPI } from "../../services/orderService";
import { updateOrder } from "../../redux/slices/orderSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

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

  // Get assigned orders
  const assignedOrders = orders.filter(
    (order) => order.assignedDriverId === driverId
  );

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const updated = await updateStatusAPI(orderId, status);
      dispatch(updateOrder(updated));
    } catch (err) {
      console.error("Failed to update order:", err);
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
                      <Badge
                        className={
                          order.status === "assigned"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "in-transit"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {order.status}
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
                      {order.status === "assigned" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(order._id, "in-transit")
                          }
                          className="flex-1"
                        >
                          Start Delivery
                        </Button>
                      )}
                      {order.status === "in-transit" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(order._id, "delivered")
                          }
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      {order.status === "delivered" && (
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
