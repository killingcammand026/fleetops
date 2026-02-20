// Order Card with Driver Assignment Option
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { assignDriverAPI } from "../../services/orderService";
import { updateOrder } from "../../redux/slices/orderSlice";
import { getAllDriversAPI } from "../../services/driverService";
import { setDrivers } from "../../redux/slices/driverSlice";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

const OrderCardWithAssignment = ({ order, showAssignButton = false }) => {
  const dispatch = useDispatch();
  const { drivers } = useSelector((state) => state.driver);
  const [loading, setLoading] = useState(false);
  const [showDriverSelect, setShowDriverSelect] = useState(false);

  useEffect(() => {
   
    if (drivers.length === 0) {
      const loadDrivers = async () => {
        try {
          const result = await getAllDriversAPI();
          if (result?.data) {
            dispatch(setDrivers(result.data));
          }
        } catch (err) {
          console.error("Failed to load drivers:", err);
        }
      };
      loadDrivers();
    }
  }, [dispatch, drivers.length]);

  const availableDrivers = drivers.filter(
    (d) => d.status === "available" && d.isActive
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in-transit":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAssignedDriver = () => {
    if (!order?.assignedDriverId) return null;
    return drivers.find((d) => d._id === order.assignedDriverId);
  };

  const handleAssignDriver = async (driverId) => {
    setLoading(true);
    try {
      const updatedOrder = await assignDriverAPI(order._id, driverId);
      dispatch(updateOrder(updatedOrder));
      toast.success("Driver assigned successfully!");
      setShowDriverSelect(false);
    } catch (err) {
      console.error("Failed to assign driver:", err);
      toast.error("Failed to assign driver. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const assignedDriver = getAssignedDriver();
  const capitalize = (str) =>
    (str || "")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  const isAwaitingDriver =
    !showAssignButton && order.status === "pending" && !assignedDriver;

  return (
    <div className="group border border-gray-200/80 rounded-xl p-4 bg-white shadow-sm hover:shadow-xl hover:border-indigo-200/60 transition-all duration-300 ease-out hover:-translate-y-0.5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="font-semibold text-lg text-gray-900 tracking-tight">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <Badge
          className={`${getStatusColor(order.status)} transition-transform group-hover:scale-105`}
        >
          {order.status}
        </Badge>
      </div>

      <div className="space-y-3 text-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Pickup
            </span>
            <span className="text-gray-800 font-medium truncate">
              {capitalize(order.pickupAddress)}
            </span>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Delivery
            </span>
            <span className="text-gray-800 font-medium truncate">
              {capitalize(order.deliveryAddress)}
            </span>
          </div>
        </div>
        {order.priority && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Priority</span>
            <Badge
              variant="outline"
              className={
                order.priority === "high"
                  ? "border-red-300 text-red-700 bg-red-50"
                  : order.priority === "normal"
                  ? "border-indigo-300 text-indigo-700 bg-indigo-50"
                  : "border-gray-300 text-gray-600 bg-gray-50"
              }
            >
              {order.priority.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      {assignedDriver ? (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {assignedDriver.name?.charAt(0) || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-900">
                Driver Assigned
              </p>
              <p className="text-sm text-indigo-700 truncate">
                {assignedDriver.name} • {assignedDriver.vehicle?.type} (
                {assignedDriver.vehicle?.plate})
              </p>
              {assignedDriver.location && (
                <p className="text-xs text-indigo-600 mt-0.5 flex items-center gap-1">
                  <span>📍</span>
                  {assignedDriver.location.lat?.toFixed(4)},{" "}
                  {assignedDriver.location.lng?.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : isAwaitingDriver ? (
        <div className="mt-4 p-3 rounded-xl bg-gray-50/80 border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">
                Finding your driver
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Fleet manager is assigning a driver. Details will appear here
                shortly.
              </p>
            </div>
          </div>
        </div>
      ) : showAssignButton && order.status === "pending" ? (
        <div className="mt-4">
          {!showDriverSelect ? (
            <Button
              onClick={() => setShowDriverSelect(true)}
              className="w-full"
              variant="outline"
            >
              Assign Driver
            </Button>
          ) : (
            <div className="space-y-2">
              {availableDrivers.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  No available drivers at the moment
                </div>
              ) : (
                <>
                  <Select
                    onValueChange={handleAssignDriver}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver._id} value={driver._id}>
                          {driver.name} - {driver.vehicle?.type} ({driver.vehicle?.plate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setShowDriverSelect(false)}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default OrderCardWithAssignment;
