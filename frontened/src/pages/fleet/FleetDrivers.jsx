import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllDriversAPI } from "../../services/driverService";
import { getAllCustomersAPI } from "../../services/customerService";
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
  phone: "",
});


const [customers, setCustomers] = useState([]);

// Backend expects userId = User document _id. Customer has userId (ref User). Normalize to string everywhere.
const getCustomerUserId = (customer) => {
  const u = customer?.userId;
  if (u == null) return null;
  if (typeof u === "string") return u.trim();
  if (typeof u === "object" && u.$oid) return String(u.$oid);
  const id = u._id ?? u;
  return id != null ? String(id) : null;
};

// Normalize driver's userId for Set comparison (backend may return ObjectId or string)
const getDriverUserId = (driver) => {
  const u = driver?.userId;
  if (u == null) return null;
  if (typeof u === "string") return u.trim();
  if (typeof u === "object" && u._id) return String(u._id);
  return String(u);
};

useEffect(() => {
  const fetchData = async () => {
    try {
      const driverRes = await getAllDriversAPI();
      const driverData = Array.isArray(driverRes?.data) ? driverRes.data : (Array.isArray(driverRes) ? driverRes : []);
      dispatch(setDrivers(driverData));

      const existingDriverUserIds = new Set(
        driverData.map((d) => getDriverUserId(d)).filter(Boolean)
      );

      let customerList = [];
      try {
        const customersRes = await getAllCustomersAPI();
        customerList = Array.isArray(customersRes) ? customersRes : [];
      } catch (e) {
        customerList = [];
      }

      const availableCustomers = customerList.filter(
        (c) => !existingDriverUserIds.has(String(getCustomerUserId(c) ?? ""))
      );

      setCustomers(availableCustomers);
    } catch (err) {
      console.error("Fetch error:", err);
      setCustomers([]);
    }
  };

  fetchData();
}, [dispatch]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.userId || !formData.vehiclePlate || !formData.phone) {
    toast.error("Please select a customer, enter vehicle plate and phone.");
    return;
  }

  setLoading(true);

  try {
    const userIdForm = String((formData.userId || "").trim());
    const selectedCustomer = customers.find(
      (c) => String(getCustomerUserId(c) ?? "") === userIdForm
    );
    const userIdToSend = selectedCustomer
      ? getCustomerUserId(selectedCustomer)
      : userIdForm;
    if (!userIdToSend) {
      toast.error("Invalid customer selection. Please select a customer again.");
      setLoading(false);
      return;
    }
    // Backend Driver model: userId (User _id), name, phone, vehicle.type, vehicle.registrationNumber, liveLocation
    const driverData = {
      userId: userIdToSend,
      name: (selectedCustomer?.name || "Driver").trim(),
      phone: formData.phone.trim(),
      vehicle: {
        type: formData.vehicleType,
        registrationNumber: formData.vehiclePlate.trim(),
      },
      liveLocation: {
        type: "Point",
        coordinates: [77.209, 28.6139],
      },
    };

    const result = await createDriverAPI(driverData);
    const newDriver = result.data ?? result;

    dispatch(addDriver(newDriver));
    toast.success("Driver profile created successfully!");

    setFormData({
      userId: "",
      vehicleType: "Van",
      vehiclePlate: "",
      phone: "",
    });

  } catch (err) {
    console.error(err.response?.data || err);
    const msg = err.response?.data?.error || err.message || "Failed to add driver";
    if (typeof msg === "string" && msg.includes("only promote Customers")) {
      toast.error("Only users with Customer role can be promoted. Please select a customer from the list (not already a driver).");
      // Refetch so dropdown excludes anyone who might already be a driver
      try {
        const [driverRes, customersRes] = await Promise.all([getAllDriversAPI(), getAllCustomersAPI()]);
        const driverData = Array.isArray(driverRes?.data) ? driverRes.data : (Array.isArray(driverRes) ? driverRes : []);
        dispatch(setDrivers(driverData));
        const existingIds = new Set(driverData.map((d) => getDriverUserId(d)).filter(Boolean));
        const customerList = Array.isArray(customersRes) ? customersRes : [];
        setCustomers(customerList.filter((c) => !existingIds.has(String(getCustomerUserId(c) ?? ""))));
      } catch (_) {}
    } else {
      toast.error(msg);
    }
  } finally {
    setLoading(false);
  }
};

  const availableCount = drivers.filter(
    (d) => d.isAvailable !== false && (d.status === "Available" || d.status === "available")
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

      {/* Select Customer - Fleet Manager can only promote users with Customer role */}
      <div>
        <Label>Select Customer</Label>
        <p className="text-xs text-gray-500 mb-1">Only users with Customer role can be promoted to driver.</p>
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
            {customers.map((customer) => {
              const userId = getCustomerUserId(customer);
              if (!userId) return null;
              return (
                <SelectItem key={customer._id ?? userId} value={String(userId)}>
                  {customer.name} {customer.phone ? `(${customer.phone})` : "(Customer)"}
                </SelectItem>
              );
            })}
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
        <Label>Vehicle Plate / Registration</Label>
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

      {/* Phone (required by backend) */}
      <div>
        <Label>Phone</Label>
        <Input
          value={formData.phone}
          onChange={(e) =>
            setFormData((p) => ({ ...p, phone: e.target.value }))
          }
          placeholder="+1 234 567 8900"
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