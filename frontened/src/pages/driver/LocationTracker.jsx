import { useEffect } from "react";
import { useSelector } from "react-redux";
import { updateDriverLocationAPI } from "../../services/driverService";     

const LocationTracker = () => {
  const { currentDriver } = useSelector(
    (state) => state.driver
  );

  useEffect(() => {
    if (!currentDriver) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const longitude = pos.coords.longitude;
        const latitude = pos.coords.latitude;

        await updateDriverLocationAPI(
          currentDriver._id,
          longitude,
          latitude
        );
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentDriver]);

  return null;
};

export default LocationTracker;
