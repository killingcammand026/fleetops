import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import FleetMap from "../../components/fleet/FleetMap";
import FleetStats from "../../components/fleet/FleetStats";
import { getAllOrdersAPI } from "../../services/orderService";
import { getAllDriversAPI } from "../../services/driverService";
import { setOrders } from "../../redux/slices/orderSlice";
import { setDrivers } from "../../redux/slices/driverSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const FleetDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const drivers = useSelector((state) => state.driver?.drivers) ?? [];

  useEffect(() => {
   const loadData = async () => {
  try {
    const orders = await getAllOrdersAPI();
    dispatch(setOrders(orders || []));

    const driversRes = await getAllDriversAPI();
    const drivers = Array.isArray(driversRes?.data) ? driversRes.data : (Array.isArray(driversRes) ? driversRes : []);
    dispatch(setDrivers(drivers));
  } catch (err) {
    console.error(err);
  }
};

    loadData();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

const orders = useSelector((state) => state.order?.orders ?? []);
const pendingCount = orders.filter((o) => o.status === "CREATED").length;

const statusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "available") return "bg-emerald-500/90 text-white";
  if (s === "on_trip") return "bg-amber-500/90 text-white";
  return "bg-gray-500/90 text-white";
};

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fleet Manager Dashboard
            </h2>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name ?? "Fleet Manager"}</p>
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

        {/* All drivers – full detail and status */}
        <Card className="border-gray-200/80 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <span>All Drivers</span>
              <Badge variant="secondary" className="font-normal">{drivers.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {drivers.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">No drivers yet. Add drivers from the Drivers page.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {drivers.map((d) => (
                  <Card key={d._id} className="border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{d.name ?? "—"}</p>
                          <p className="text-sm text-gray-500">{d.phone ?? "—"}</p>
                        </div>
                        <Badge className={statusColor(d.status)}>
                          {d.status ?? "Offline"}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="text-gray-500">Vehicle:</span> {d.vehicle?.type ?? "—"} · {d.vehicle?.registrationNumber ?? "—"}</p>
                        <p><span className="text-gray-500">Available:</span> {d.isAvailable === true ? "Yes" : "No"}</p>
                        <p><span className="text-gray-500">Rating:</span> {(d.rating ?? 0).toFixed(1)} · Trips: {d.totalTrips ?? 0}</p>
                        {d.liveLocation?.coordinates?.length >= 2 && (
                          <p className="text-gray-400 text-xs">
                            Location: {Number(d.liveLocation.coordinates[1]).toFixed(4)}, {Number(d.liveLocation.coordinates[0]).toFixed(4)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <FleetMap />
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