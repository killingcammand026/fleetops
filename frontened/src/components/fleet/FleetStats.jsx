// Fleet Statistics Dashboard
import { useSelector } from "react-redux";

const FleetStats = () => {
  const { drivers } = useSelector((state) => state.driver);
  const { orders } = useSelector((state) => state.order);

  const stats = {
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter((d) => d.status === "available").length,
    onRouteDrivers: drivers.filter((d) => d.status === "on-route").length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    inTransitOrders: orders.filter((o) => o.status === "in-transit" || o.status === "assigned").length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-600 font-medium">Total Drivers</p>
        <p className="text-2xl font-bold text-blue-700">{stats.totalDrivers}</p>
        <p className="text-xs text-blue-500 mt-1">
          {stats.availableDrivers} available
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-600 font-medium">Active Orders</p>
        <p className="text-2xl font-bold text-green-700">{stats.totalOrders}</p>
        <p className="text-xs text-green-500 mt-1">
          {stats.pendingOrders} pending
        </p>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <p className="text-sm text-orange-600 font-medium">In Transit</p>
        <p className="text-2xl font-bold text-orange-700">{stats.inTransitOrders}</p>
        <p className="text-xs text-orange-500 mt-1">
          {stats.onRouteDrivers} drivers on route
        </p>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-600 font-medium">Delivered</p>
        <p className="text-2xl font-bold text-purple-700">{stats.deliveredOrders}</p>
        <p className="text-xs text-purple-500 mt-1">Today</p>
      </div>
    </div>
  );
};

export default FleetStats;
