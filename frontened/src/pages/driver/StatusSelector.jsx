import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDriverAPI } from "../../services/driverService";
import { updateDriver } from "../../redux/slices/driverSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

// Backend Driver model status enum: Available, On_Trip, Offline (exact casing)
const DRIVER_STATUSES = [
  { value: "Available", label: "Available" },
  { value: "On_Trip", label: "On Trip" },
  { value: "Offline", label: "Offline" },
];

const StatusSelector = () => {
  const dispatch = useDispatch();
  const { currentDriver } = useSelector((state) => state.driver);
  const [updating, setUpdating] = useState(false);

  const backendStatus = currentDriver?.status;
  const value = DRIVER_STATUSES.some((s) => s.value === backendStatus)
    ? backendStatus
    : "Offline";

  const changeStatus = async (newValue) => {
    if (!currentDriver?._id) return;
    setUpdating(true);
    try {
      const res = await updateDriverAPI(currentDriver._id, { status: newValue });
      const updated = res?.data ?? res;
      if (updated) {
        dispatch(updateDriver(updated));
        toast.success("Status updated");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Select
      value={value}
      onValueChange={changeStatus}
      disabled={updating}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {DRIVER_STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;