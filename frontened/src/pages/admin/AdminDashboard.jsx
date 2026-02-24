import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  startLoading,
  setUsers,
  addUser,
  userError,
} from "../../redux/slices/userSlice";
import { setDrivers } from "../../redux/slices/driverSlice";
import { setOrders } from "../../redux/slices/orderSlice";

import {
  getAllUsersAPI,
  createFleetManagerAPI,
} from "../../services/userService";
import { createDriverAPI, getAllDriversAPI } from "../../services/driverService";
import { getAllOrdersAPI } from "../../services/orderService";
import UserTable from "./UserTable";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, loading, error, fleetManagers } = useSelector(
    (state) => state.user
  );
  const drivers = useSelector((state) => state.driver?.drivers ?? []);
  const orders = useSelector((state) => state.order?.orders ?? []);

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [driverFormUser, setDriverFormUser] = useState(null);
  const [driverFormData, setDriverFormData] = useState({
    vehicleType: "Van",
    vehiclePlate: "",
    phone: "",
  });
  const [driverFormLoading, setDriverFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      dispatch(startLoading());
      const [usersRes, driverRes, ordersRes] = await Promise.all([
        getAllUsersAPI(),
        getAllDriversAPI(),
        getAllOrdersAPI(),
      ]);

      dispatch(setUsers(Array.isArray(usersRes) ? usersRes : []));

      const driverData = Array.isArray(driverRes?.data)
        ? driverRes.data
        : Array.isArray(driverRes)
        ? driverRes
        : [];

      const ordersData =
        Array.isArray(ordersRes?.data?.data) || Array.isArray(ordersRes?.data)
          ? ordersRes.data.data || ordersRes.data
          : Array.isArray(ordersRes)
          ? ordersRes
          : [];

      dispatch(setDrivers(driverData));
      dispatch(setOrders(ordersData));
    } catch (err) {
      dispatch(
        userError(err.response?.data?.error || "Failed to load admin data")
      );
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateFleetManager = async (e) => {
    e.preventDefault();
    try {
      dispatch(startLoading());
      const newUser = await createFleetManagerAPI(formData);
      dispatch(addUser(newUser));
      setShowForm(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      dispatch(userError(err.response?.data?.error || "Creation failed"));
    }
  };

  const handleMakeDriver = (user) => {
    setDriverFormUser(user);
    setDriverFormData({ vehicleType: "Van", vehiclePlate: "", phone: "" });
  };

  const handleDriverFormSubmit = async (e) => {
    e.preventDefault();
    if (!driverFormUser) return;
    if (!driverFormData.vehiclePlate?.trim() || !driverFormData.phone?.trim()) {
      toast.error("Vehicle plate and phone are required.");
      return;
    }
    setDriverFormLoading(true);
    try {
      const driverPayload = {
        userId: driverFormUser._id,
        name: driverFormUser.name || "Driver",
        phone: driverFormData.phone.trim(),
        vehicle: {
          type: driverFormData.vehicleType,
          registrationNumber: driverFormData.vehiclePlate.trim(),
        },
        liveLocation: { type: "Point", coordinates: [77.209, 28.6139] },
      };
      await createDriverAPI(driverPayload);
      toast.success("Driver profile created. User role set to Driver.");
      setDriverFormUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create driver profile.");
    } finally {
      setDriverFormLoading(false);
    }
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Driver & order stats
  const driverStats = {
    total: drivers.length,
    available: drivers.filter(
      (d) =>
        d.status?.toLowerCase() === "available" ||
        d.isAvailable === true
    ).length,
    onTrip: drivers.filter((d) =>
      (d.status || "").toLowerCase().includes("on_trip")
    ).length,
  };

  const orderStats = {
    total: orders.length,
    created: orders.filter((o) => o.status === "CREATED").length,
    inProgress: orders.filter((o) =>
      ["DRIVER_ASSIGNED", "DRIVER_ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(
        o.status
      )
    ).length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };

  // Map: fleetManagerId -> driver count
  const driversPerFleet = drivers.reduce((acc, d) => {
    const fmId = d.fleetManagerId?.toString?.() || d.fleetManagerId;
    if (!fmId) return acc;
    acc[fmId] = (acc[fmId] || 0) + 1;
    return acc;
  }, {});

  const fleetOverview = (fleetManagers || []).map((fm) => ({
    _id: fm._id,
    name: fm.name,
    email: fm.email,
    driverCount: driversPerFleet[fm._id?.toString?.()] || 0,
  }));

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen px-4 sm:px-6 lg:px-10 py-6 space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-500">
              Full control over users, drivers, fleet managers and orders
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 rounded-2xl shadow-lg min-w-[160px]">
              <p className="text-sm opacity-80">Total Users</p>
              <h2 className="text-2xl font-bold">{users?.length || 0}</h2>
            </div>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-4 rounded-2xl shadow-lg min-w-[160px]">
              <p className="text-sm opacity-80">Drivers</p>
              <h2 className="text-xl font-semibold">
                {driverStats.total}{" "}
                <span className="text-xs font-normal">
                  ({driverStats.available} available / {driverStats.onTrip} on trip)
                </span>
              </h2>
            </div>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-4 rounded-2xl shadow-lg min-w-[160px]">
              <p className="text-sm opacity-80">Orders</p>
              <h2 className="text-xl font-semibold">
                {orderStats.total}{" "}
                <span className="text-xs font-normal">
                  ({orderStats.created} created / {orderStats.inProgress} in progress /{" "}
                  {orderStats.delivered} delivered)
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 
        bg-white p-5 rounded-2xl shadow-md w-full">

          {/* Search */}
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
              outline-none transition-all duration-300"
            />
            <span className="absolute left-4 top-3 text-gray-400">
              🔍
            </span>
          </div>

          {/* Button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r 
            from-blue-600 to-indigo-600 text-white 
            rounded-xl shadow-md hover:shadow-xl 
            hover:scale-105 transition-all duration-300"
          >
            + Create Fleet Manager
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 
            border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 
          text-red-700 px-4 py-3 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* Users + system overview */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* User Table */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300 w-full overflow-hidden xl:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 text-lg">All Users</h2>
              <p className="text-xs text-gray-500">
                Roles control access. Driver & fleet stats update in real time from backend.
              </p>
            </div>
            <UserTable
              users={filteredUsers}
              refresh={fetchUsers}
              onMakeDriver={handleMakeDriver}
            />
          </div>

          {/* Fleet Manager / Driver summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Drivers by Fleet Manager</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm max-h-[260px] overflow-auto">
                {fleetOverview.length === 0 ? (
                  <p className="text-gray-500">No fleet managers yet.</p>
                ) : (
                  fleetOverview.map((fm) => (
                    <div
                      key={fm._id}
                      className="flex items-center justify-between border-b last:border-b-0 py-2"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{fm.name}</p>
                        <p className="text-xs text-gray-500">{fm.email}</p>
                      </div>
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                        {fm.driverCount} driver{fm.driverCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Live Driver Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs max-h-[220px] overflow-auto">
                {drivers.length === 0 ? (
                  <p className="text-gray-500">No drivers yet.</p>
                ) : (
                  drivers.map((d) => (
                    <div
                      key={d._id}
                      className="flex items-center justify-between border-b last:border-b-0 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {d.name}{" "}
                          <span className="text-[10px] text-gray-500">
                            ({d.vehicle?.type ?? "Vehicle"})
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {d.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-[11px] font-semibold ${
                            (d.status || "").toLowerCase() === "available"
                              ? "text-emerald-600"
                              : (d.status || "").toLowerCase().includes("on_trip")
                              ? "text-amber-600"
                              : "text-gray-500"
                          }`}
                        >
                          {d.status ?? "Offline"}
                        </p>
                        {typeof d.isAvailable === "boolean" && (
                          <p className="text-[10px] text-gray-400">
                            Pool: {d.isAvailable ? "Available" : "Busy"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fleet Manager Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center 
          bg-black/40 backdrop-blur-sm z-50 px-4">

            <div className="bg-white w-full max-w-lg p-6 sm:p-8 
            rounded-2xl shadow-2xl relative">

              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-400 
                hover:text-red-500 transition"
              >
                ✖
              </button>

              <h2 className="text-xl font-semibold mb-6">
                Create Fleet Manager
              </h2>

              <form
                onSubmit={handleCreateFleetManager}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 
                  focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 
                  focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 
                  focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-green-600 
                  text-white rounded-lg hover:bg-green-700 
                  transition duration-300"
                >
                  Create Manager
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Driver form modal: when Admin sets role to Driver */}
        {driverFormUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Create Driver Profile</CardTitle>
                <button
                  type="button"
                  onClick={() => setDriverFormUser(null)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✖
                </button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Fill driver details for <strong>{driverFormUser.name}</strong> ({driverFormUser.email}). After saving, their role will be set to Driver.
                </p>
                <form onSubmit={handleDriverFormSubmit} className="space-y-4">
                  <div>
                    <Label>Vehicle Type</Label>
                    <Select
                      value={driverFormData.vehicleType}
                      onValueChange={(v) => setDriverFormData((p) => ({ ...p, vehicleType: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Bike">Bike</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vehicle Plate / Registration</Label>
                    <Input
                      value={driverFormData.vehiclePlate}
                      onChange={(e) => setDriverFormData((p) => ({ ...p, vehiclePlate: e.target.value }))}
                      placeholder="ABC-123"
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={driverFormData.phone}
                      onChange={(e) => setDriverFormData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setDriverFormUser(null)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={driverFormLoading} className="flex-1">
                      {driverFormLoading ? "Creating..." : "Create Driver"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;