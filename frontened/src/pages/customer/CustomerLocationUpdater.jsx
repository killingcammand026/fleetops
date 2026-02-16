import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startLoading,
  setCustomer,
  customerError,
} from "../../redux/slices/customerSlice";
import { updateCustomerLocationAPI } from "../../services/customerService";

const CustomerLocationUpdater = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);


  const updateLocation=() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
            dispatch(startLoading());
            const updated  = await updateCustomerLocationAPI(user.id, { latitude, longitude });
            dispatch(setCustomer(updated ));
            alert("Location updated successfully");
        }
        catch (err) {
            dispatch(customerError(err.response?.data?.message || "Failed to update location"));
        }
    },
     (error) => {
        alert("Location permission denied");
      }
    );
  };

   return (
    <button
      onClick={updateLocation}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Update My Location
    </button>
  );
};

export default CustomerLocationUpdater;

