import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllOrdersAPI } from "../../services/orderService";
import { setOrders } from "../../redux/slices/orderSlice";
import OrderCard from "../../components/orders/OrderCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const CustomerOrders = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

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

  // Filter orders for this customer
 const safeOrders = Array.isArray(orders) ? orders : [];

const myOrders = safeOrders.filter((order) => {
  const customerId =
    typeof order.customerId === "object"
      ? order.customerId._id
      : order.customerId;

  return customerId?.toString() === user?._id?.toString();
});

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-600 mt-1">View and track all your orders</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order History ({myOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {myOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No orders yet</p>
                <p className="text-sm mt-2">
                  Go to Dashboard to create your first order
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">From:</span>{" "}
                        {order.pickupAddress}
                      </div>
                      <div>
                        <span className="font-medium">To:</span>{" "}
                        {order.deliveryAddress}
                      </div>
                      {order.assignedDriverId && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-600">
                            Driver assigned - Order in progress
                          </p>
                        </div>
                      )}
                      {order.deliveredAt && (
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-xs text-green-600">
                            Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                          </p>
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

export default CustomerOrders;