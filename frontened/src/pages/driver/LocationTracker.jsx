import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateDriverLocationAPI, getDriverByIdAPI } from "../../services/driverService";
import { updateDriver } from "../../redux/slices/driverSlice";
import locationSimulator from "../../services/locationSimulator";

const LocationTracker = () => {
  const { currentDriver } = useSelector((state) => state.driver);
  const dispatch = useDispatch();
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!currentDriver) return;

    let watchId = null;
    let updateInterval = null;
    let simulationStarted = false;

    const startSimulation = () => {
      if (simulationStarted) return;
      simulationStarted = true;
      setIsSimulating(true);
      const initialLocation = currentDriver.location || {
        lat: 28.6139,
        lng: 77.2090,
      };
      locationSimulator.startSimulation(currentDriver._id, initialLocation);

      updateInterval = setInterval(async () => {
        try {
          const res = await getDriverByIdAPI(currentDriver._id);
          const updated = res?.data ?? res;
          if (updated) dispatch(updateDriver(updated));
        } catch (err) {
          console.error("Failed to fetch driver location:", err);
        }
      }, 3000);
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            const result = await updateDriverLocationAPI(
              currentDriver._id,
              pos.coords.longitude,
              pos.coords.latitude
            );
            const driver = result?.data ?? result;
            if (driver) dispatch(updateDriver(driver));
          } catch (err) {
            console.error("Failed to update driver location:", err);
          }
        },
        () => {
          console.log("Geolocation unavailable, using simulator");
          startSimulation();
        }
      );
    } else {
      startSimulation();
    }

    return () => {
      if (watchId !== null) navigator.geolocation?.clearWatch(watchId);
      if (updateInterval) clearInterval(updateInterval);
      locationSimulator.stopSimulation(currentDriver._id);
    };
  }, [currentDriver, dispatch, isSimulating]);

  return null;
};

export default LocationTracker;