import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import CreateOrderForm from "../../components/orders/CreateOrderForm";
import OrderCardWithAssignment from "../../components/orders/OrderCardWithAssignment";
import {
  startLoading,
  setCustomer,
  customerError,
} from "../../redux/slices/customerSlice";
import { getCustomerByIdAPI } from "../../services/customerService";
import { getAllOrdersAPI } from "../../services/orderService";
import { setOrders } from "../../redux/slices/orderSlice";
import CustomerLocationUpdater from "./CustomerLocationUpdater";
import CustomerLiveMap from "../../components/customer/CustomerLiveMap";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentCustomer, loading } = useSelector((state) => state.customer);
  const orders = useSelector((state) => state.order.orders) || [];
  const [autoRefresh, setAutoRefresh] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      dispatch(startLoading());

      // Use logged in user directly
      dispatch(setCustomer(user));

      const ordersData = await getAllOrdersAPI();
      dispatch(setOrders(ordersData));

    } catch (err) {
      console.error("Failed to load data:", err);
      dispatch(customerError("Failed to load customer data"));
    }
  };

  if (user) {
    fetchData();
  }
}, [dispatch, user]);

  // Auto-refresh orders every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const ordersData = await getAllOrdersAPI();
        dispatch(setOrders(Array.isArray(ordersData) ? ordersData : []));
      } catch (err) {
        console.error("Failed to refresh orders:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, autoRefresh]);

  
  const safeOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders]
  );

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

  // Backend statuses → logical buckets for UI
  const statusForBucket = (rawStatus) => (rawStatus || "").toUpperCase();

  const sortedOrders = [...myOrders].sort((a, b) => {
    const sa = statusForBucket(a.status);
    const sb = statusForBucket(b.status);

    const isPendingA = sa === "CREATED" || sa === "DRIVER_ASSIGNED";
    const isPendingB = sb === "CREATED" || sb === "DRIVER_ASSIGNED";
    if (isPendingA !== isPendingB) return isPendingA ? -1 : 1;

    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const pendingOrders = sortedOrders.filter((o) => {
    const s = statusForBucket(o.status);
    return s === "CREATED" || s === "DRIVER_ASSIGNED";
  });

  const activeOrders = sortedOrders.filter((o) => {
    const s = statusForBucket(o.status);
    return (
      s === "DRIVER_ACCEPTED" ||
      s === "PICKED_UP" ||
      s === "IN_TRANSIT"
    );
  });

  const completedOrders = sortedOrders.filter((o) => {
    const s = statusForBucket(o.status);
    return s === "DELIVERED";
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header with Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Customer Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-medium text-gray-800">{user?.name || "Customer"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Auto-refresh
            </label>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg text-sm font-medium border border-amber-200/60 hover:bg-amber-100 transition-colors">
                {pendingOrders.length} Pending
              </span>
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-lg text-sm font-medium border border-indigo-200/60 hover:bg-indigo-100 transition-colors">
                {activeOrders.length} Active
              </span>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-medium border border-emerald-200/60 hover:bg-emerald-100 transition-colors">
                {completedOrders.length} Completed
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="group bg-gradient-to-br from-amber-50 to-amber-100/80 border-amber-200/80 hover:shadow-md hover:shadow-amber-200/30 transition-all duration-300 hover:-translate-y-0.5 cursor-default">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">Pending Orders</p>
                  <p className="text-3xl font-bold text-amber-900 mt-1 tabular-nums">
                    {pendingOrders.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-200/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ⏳
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group bg-gradient-to-br from-indigo-50 to-indigo-100/80 border-indigo-200/80 hover:shadow-md hover:shadow-indigo-200/30 transition-all duration-300 hover:-translate-y-0.5 cursor-default">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-800">Active Deliveries</p>
                  <p className="text-3xl font-bold text-indigo-900 mt-1 tabular-nums">
                    {activeOrders.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-200/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🚚
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-emerald-200/80 hover:shadow-md hover:shadow-emerald-200/30 transition-all duration-300 hover:-translate-y-0.5 cursor-default">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-800">Completed</p>
                  <p className="text-3xl font-bold text-emerald-900 mt-1 tabular-nums">
                    {completedOrders.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-200/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ✓
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  
       <div className="max-w-md bg-white shadow-md rounded-xl p-6 border hover:shadow-xl transition-all duration-300">
  
  <div className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
    Customer Data
  </div>

  <div className="space-y-3 text-gray-700">
    
    <div className="flex justify-between items-center">
      <span className="font-medium">Name:</span>
      <span className="text-gray-900">{currentCustomer?.name || "N/A"}</span>
    </div>

    <div className="flex justify-between items-center">
      <span className="font-medium">Email:</span>
      <span
        onClick={() => navigator.clipboard.writeText(currentCustomer?.email)}
        className="text-blue-600 cursor-pointer hover:underline"
        title="Click to copy"
      >
        {currentCustomer?.email || "N/A"}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="font-medium">Role:</span>
      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 capitalize">
        {user?.role || "N/A"}
      </span>
    </div>

  </div>
</div>


          {/* Orders List */}
          <div className="space-y-5">
            {sortedOrders.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-indigo-100 flex items-center justify-center text-4xl">
                    📦
                  </div>
                  <p className="text-lg font-semibold text-gray-800">No orders yet</p>
                  <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                    Create your first order using the form on the left to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {pendingOrders.length > 0 && (
                  <Card className="overflow-hidden border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">⏳</span>
                        Pending Orders ({pendingOrders.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pendingOrders.map((order) => (
                        <OrderCardWithAssignment
                          key={order._id}
                          order={order}
                          showAssignButton={false}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {activeOrders.length > 0 && (
                  <Card className="overflow-hidden border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">🚚</span>
                        Active Deliveries ({activeOrders.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeOrders.map((order) => (
                        <OrderCardWithAssignment
                          key={order._id}
                          order={order}
                          showAssignButton={false}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {completedOrders.length > 0 && (
                  <Card className="overflow-hidden border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">✓</span>
                        Completed Orders ({completedOrders.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {completedOrders.map((order) => (
                        <OrderCardWithAssignment
                          key={order._id}
                          order={order}
                          showAssignButton={false}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Live customer & driver map for this customer's orders */}
        <CustomerLiveMap />

        {/* Background geolocation updater */}
        <CustomerLocationUpdater />
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default CustomerDashboard;