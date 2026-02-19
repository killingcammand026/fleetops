import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import FleetOrders from "../../components/orders/FleetOrders";
import FleetMap from "../../components/fleet/FleetMap";
import FleetStats from "../../components/fleet/FleetStats";
import { getAllOrdersAPI } from "../../services/orderService";
import { getAllDriversAPI } from "../../services/driverService";
import { setOrders } from "../../redux/slices/orderSlice";
import { setDrivers } from "../../redux/slices/driverSlice";
import { setAssignments } from "../../redux/slices/assignmentSlice";

const FleetDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load orders (customer-placed orders for fleet manager to assign)
        const orders = await getAllOrdersAPI();
        dispatch(setOrders(orders));

        // Load drivers (for assignment to orders)
        const driversRes = await getAllDriversAPI();
        const drivers = driversRes?.data ?? driversRes;
        if (Array.isArray(drivers)) dispatch(setDrivers(drivers));

        // Assignments are derived from orders (orders with assignedDriverId)
        dispatch(setAssignments([]));
      } catch (err) {
        console.error("Failed to load fleet data:", err);
      }
    };

    loadData();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const { orders } = useSelector((state) => state.order);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const assignedCount = orders.filter((o) => o.status === "assigned").length;
  const inTransitCount = orders.filter((o) => o.status === "in-transit").length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fleet Manager Dashboard
            </h2>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
          </div>
        </div>

        {/* Quick Stats */}
        <FleetStats />

        {/* Alert for pending orders */}
        {pendingCount > 0 && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg animate-slide-in">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800">
                  {pendingCount} order{pendingCount > 1 ? "s" : ""} pending assignment
                </p>
                <p className="text-sm text-yellow-700">
                  Assign drivers to process these orders
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-in-left">
            <FleetMap />
          </div>
          <div className="animate-slide-in-right">
            <FleetOrders />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default FleetDashboard;
