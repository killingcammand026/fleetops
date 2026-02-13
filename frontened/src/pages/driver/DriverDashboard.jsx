import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startLoading,
  setCurrentDriver,
  driverError,
} from "../../redux/slices/driverSlice";

import { getDriverByIdAPI } from "../../services/driverService";
import DriverMap from "./DriverMap";
import StatusSelector from "../../components/driver/StatusSelector";
import LocationTracker from "../../components/driver/LocationTracker";

const DriverDashboard=() => {
    const dispatch=useDispatch();
    const {currentDriver}=useSelector((state)=>state.driver
);

  const driverId = localStorage.getItem("driverId");


    useEffect(() => {
        const fetchDriver = async () => {
            try {
                dispatch(startLoading());
                const data = await getDriverByIdAPI(driverId);
                dispatch(setCurrentDriver(data));
            } catch (err) {
                dispatch(driverError(err.response?.data?.message || "Failed to load driver data"));
            }
        };

        fetchDriver();
    }, [dispatch, driverId]);

    if (!currentDriver) return <div>Loading...</div>;


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome {currentDriver.name}
      </h1>

      <StatusSelector />

      <DriverMap />

      <LocationTracker />
    </div>
  );
};

export default DriverDashboard;

