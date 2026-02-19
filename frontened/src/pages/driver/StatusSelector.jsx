import React from "react";
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

const StatusSelector = () => {
  const dispatch = useDispatch();
  const { currentDriver } = useSelector((state) => state.driver);

  const changeStatus = async (value) => {
    try {
      const result = await updateDriverAPI(currentDriver._id, { status: value });
      if (result?.data) {
        dispatch(updateDriver(result.data));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <Select
      value={currentDriver.status || "available"}
      onValueChange={changeStatus}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="available">Available</SelectItem>
        <SelectItem value="on-route">On Route</SelectItem>
        <SelectItem value="busy">Busy</SelectItem>
        <SelectItem value="offline">Offline</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;