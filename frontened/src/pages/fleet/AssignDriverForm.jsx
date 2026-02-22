import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { assignDriverAPI } from "../../services/orderService";
import { updateOrder } from "../../redux/slices/orderSlice";
import { addAssignment } from "../../redux/slices/assignmentSlice";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

const AssignDriverForm = ({ orderId }) => {
  const dispatch = useDispatch();
  const { drivers } = useSelector((state) => state.driver);
  const [loading, setLoading] = useState(false);

  // Backend Driver: status "Available" | "On_Trip" | "Offline", isAvailable
  const availableDrivers = drivers.filter(
    (d) => d.isAvailable !== false && (d.status === "Available" || d.status === "available")
  );

  const handleAssign = async (driverId) => {
    setLoading(true);
    try {
      const updatedOrder = await assignDriverAPI(orderId, driverId);
      dispatch(updateOrder(updatedOrder));
      
      // Also add to assignments
      dispatch(addAssignment({
        _id: `assign_${Date.now()}`,
        orderId,
        driverId,
        status: "assigned",
        assignedAt: new Date().toISOString(),
      }));

      const driver = drivers.find((d) => d._id === driverId);
      toast.success(`Driver ${driver?.name || "assigned"} assigned successfully!`, {
        duration: 3000,
      });
    } catch (err) {
      console.error("Failed to assign driver:", err);
      toast.error("Failed to assign driver. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (availableDrivers.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2">
        No available drivers
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Assign Driver:</p>
      <div className="space-y-1">
        {availableDrivers.map((driver) => (
          <div
            key={driver._id}
            className="flex items-center justify-between p-2 border rounded bg-gray-50"
          >
            <div>
              <p className="text-sm font-medium">{driver.name}</p>
              <p className="text-xs text-gray-500">
                {driver.vehicle?.type} - {driver.vehicle?.registrationNumber || driver.vehicle?.plate}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleAssign(driver._id)}
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignDriverForm;