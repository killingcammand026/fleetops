import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDriverAPI } from "../../services/driverService";
import { updateDriver } from "../../redux/slices/driverSlice";
import { Select } from "../ui/select";

const StatusSelector = () => {
  const dispatch = useDispatch();
  const { currentDriver } = useSelector(
    (state) => state.driver
  );

  
  const changeStatus = async (e) => {
    const updated = await updateDriverAPI(
      currentDriver._id,
      { status: e.target.value }
    );

    dispatch(updateDriver(updated.data));
  };

  return (
    <select
      value={currentDriver.status}
      onChange={changeStatus}
      className="border p-2 rounded"
    >
      <option value="Available">Available</option>
      <option value="On_Trip">On Trip</option>
      <option value="Offline">Offline</option>
    </select>
  );
}; 


export default StatusSelector;