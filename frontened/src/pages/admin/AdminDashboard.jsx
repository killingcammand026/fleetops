import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  startLoading,
  setUsers,
  addUser,
  userError,
} from "../../redux/slices/userSlice";

import {
  getAllUsersAPI,
  createFleetManagerAPI,
} from "../../services/userService";
import { createDriverAPI } from "../../services/driverService";
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
  const { users, loading, error } = useSelector((state) => state.user);

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
      const data = await getAllUsersAPI();
      dispatch(setUsers(Array.isArray(data) ? data : []));
    } catch (err) {
      dispatch(userError(err.response?.data?.error || "Failed to load users"));
    }
  };

  useEffect(() => {
    fetchUsers();
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
              Manage fleet managers and system users
            </p>
          </div>

          {/* Stats Card */}
          <div className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 
          text-white px-6 py-4 rounded-2xl shadow-lg">
            <p className="text-sm opacity-80">Total Users</p>
            <h2 className="text-2xl font-bold">{users?.length || 0}</h2>
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

        {/* User Table */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md 
        hover:shadow-lg transition duration-300 w-full overflow-hidden">
          <UserTable users={filteredUsers} refresh={fetchUsers} onMakeDriver={handleMakeDriver} />
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