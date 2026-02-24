import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startLoading, setCustomer, customerError } from "../../redux/slices/customerSlice";
import { updateCustomerLocationAPI } from "../../services/customerService";

const CustomerLocationUpdater = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);


  useEffect(() => {
    if (!user) return;

    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          dispatch(startLoading());
          const updated = await updateCustomerLocationAPI(
            user.id || user._id,
            longitude,
            latitude
          );
          dispatch(setCustomer(updated));
        } catch (err) {
          dispatch(
            customerError(
              err.response?.data?.message ||
                "Failed to update location"
            )
          );
        }
      },
      (error) => {
        console.warn("Customer location permission denied:", error);
      }
    );

    return () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [dispatch, user]);

  return null;
};

export default CustomerLocationUpdater;