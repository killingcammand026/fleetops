import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startLoading,
  setDrivers,
} from "../../redux/slices/driverSlice";
import { getAllDriversAPI } from "../../services/driverService";

const DriversList = () => {
  const dispatch = useDispatch();
  const { drivers } = useSelector(
    (state) => state.driver
  );

   useEffect(() => {
    const fetchDrivers = async () => {
      dispatch(startLoading());
      const res = await getAllDriversAPI();
      dispatch(setDrivers(res.data));
    };

    fetchDrivers();
  }, [dispatch]);

return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
            Drivers List
        </h1>
        {drivers.length === 0 ? (
            <p>No drivers found.</p>
        ) : drivers.map((driver) => (
            <div key={driver._id} className="border p-4 mb-2 rounded">
                <p>Name: {driver.name}</p>
                <p>Phone: {driver.phone}</p>
                <p>Status: {driver.status}</p>
                <p>Rating: {driver.rating}</p>
          </div>
      ))}    
    </div>
);
};


export default DriversList;