import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllDriversAPI } from "../../services/driverService";
import { getAllUsersAPI } from "../../services/userService";
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
 const drivers = useSelector((state) => state.driver?.drivers) || [];
  const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
  userId: "",
  vehicleType: "Van",
  vehiclePlate: "",
});


const [customers, setCustomers] = useState([]);
  

useEffect(() => {
  const fetchData = async () => {
    try {
      const driverRes = await getAllDriversAPI();
      const driverData = driverRes.data?.data || driverRes.data || [];
      dispatch(setDrivers(driverData));

      const userRes = await getAllUsersAPI();
      const allUsers = userRes.data?.data || userRes.data || [];

      console.log("All Users:", allUsers);

      const existingDriverUserIds = driverData.map(
        (d) => d.userId
      );

      const customerUsers = allUsers.filter(
        (u) =>
          u.role === "Customer" &&
          !existingDriverUserIds.includes(u._id)
      );

      setCustomers(customerUsers);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  fetchData();
}, [dispatch]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.userId || !formData.vehiclePlate) {
    toast.error("Please select a customer and enter vehicle plate.");
    return;
  }

  setLoading(true);

  try {
    const driverData = {
      userId: formData.userId,
      vehicle: {
        type: formData.vehicleType,
        plate: formData.vehiclePlate,
      },
    };

    const result = await createDriverAPI(driverData);
    const newDriver = result.data;

    dispatch(addDriver(newDriver));
    toast.success("Driver profile created successfully!");

    setFormData({
      userId: "",
      vehicleType: "Van",
      vehiclePlate: "",
    });

  } catch (err) {
    console.error(err.response?.data || err);
    toast.error(err.response?.data?.error || "Failed to add driver");
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
          <Card className="border-gray-200/80 shadow-sm overflow-hidden max-w-xl">
  <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-gray-100">
    <CardTitle>Add New Driver</CardTitle>
  </CardHeader>

  <CardContent className="pt-5">
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Select Customer */}
      <div>
        <Label>Select Customer</Label>
        <Select
          value={formData.userId}
          onValueChange={(value) =>
            setFormData((p) => ({ ...p, userId: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((user) => (
              <SelectItem key={user._id} value={user._id}>
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle Type */}
      <div>
        <Label>Vehicle Type</Label>
        <Select
          value={formData.vehicleType}
          onValueChange={(value) =>
            setFormData((p) => ({ ...p, vehicleType: value }))
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

      {/* Vehicle Plate */}
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

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Driver"}
      </Button>

    </form>
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
