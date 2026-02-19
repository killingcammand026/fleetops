import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllDriversAPI } from "../../services/driverService";
import { createDriverAPI } from "../../services/driverService";
import { setDrivers, addDriver } from "../../redux/slices/driverSlice";
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

const FleetDrivers = () => {
  const dispatch = useDispatch();
  const { drivers } = useSelector((state) => state.driver);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleType: "Van",
    vehiclePlate: "",
  });

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const result = await getAllDriversAPI();
        const data = result?.data ?? result;
        dispatch(setDrivers(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
        dispatch(setDrivers([]));
      }
    };
    fetchDrivers();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.vehiclePlate) {
      toast.error("Please fill name, email, and vehicle plate.");
      return;
    }
    setLoading(true);
    try {
      const driverData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        vehicle: {
          type: formData.vehicleType,
          plate: formData.vehiclePlate.trim(),
        },
      };
      const result = await createDriverAPI(driverData);
      const newDriver = result?.data ?? result;
      dispatch(addDriver(newDriver));
      toast.success(`Driver ${newDriver.name} added successfully!`);
      setFormData({
        name: "",
        email: "",
        phone: "",
        vehicleType: "Van",
        vehiclePlate: "",
      });
    } catch (err) {
      console.error("Failed to add driver:", err);
      toast.error("Failed to add driver. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const availableCount = drivers.filter(
    (d) => d.status === "available" && d.isActive !== false
  ).length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Manage Drivers
          </h2>
          <p className="text-gray-600 mt-1">
            Add drivers and assign them to customer orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Driver Form */}
          <Card className="border-gray-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  +
                </span>
                Add New Driver
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Driver name"
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="driver@example.com"
                    required
                  />
                </div>
                <div>
                  <Label>Phone (optional)</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+1234567890"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vehicle Type</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, vehicleType: v }))
                      }
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
                    <Label>Vehicle Plate</Label>
                    <Input
                      value={formData.vehiclePlate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          vehiclePlate: e.target.value,
                        }))
                      }
                      placeholder="ABC-123"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Driver"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Drivers List */}
          <Card className="border-gray-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Drivers ({drivers.length})</CardTitle>
                <span className="text-sm text-indigo-600 font-medium">
                  {availableCount} available
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-5 max-h-[400px] overflow-y-auto">
              {drivers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">🚗</div>
                  <p className="font-medium">No drivers yet</p>
                  <p className="text-sm mt-1">
                    Add drivers using the form. They can be assigned to customer
                    orders.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drivers.map((driver) => (
                    <div
                      key={driver._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {driver.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {driver.vehicle?.type} - {driver.vehicle?.plate}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driver.status === "available" && driver.isActive !== false
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {driver.status === "available" &&
                        driver.isActive !== false
                          ? "Available"
                          : "Busy"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
          <p className="text-sm text-indigo-800">
            <strong>Flow:</strong> When a customer places an order, it appears in
            the Orders section. Go to <strong>Orders</strong> to assign one of
            these drivers to each pending order.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FleetDrivers;
