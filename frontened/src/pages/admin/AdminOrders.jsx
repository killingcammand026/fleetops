import { useEffect } from "react";
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
  Orders ({Array.isArray(orders) ? orders.length : 0})
</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(orders) && orders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">
                          {order.customerName || "Customer"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Order #{order._id.slice(-8).toUpperCase()} •{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">From:</span>{" "}
                        {order.pickupAddress}
                      </div>
                      <div>
                        <span className="font-medium">To:</span>{" "}
                        {order.deliveryAddress}
                      </div>
                      {order.assignedDriverId && (
                        <div className="mt-2 text-xs text-blue-600">
                          Driver ID: {order.assignedDriverId.slice(-6)}
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

export default AdminOrders;
