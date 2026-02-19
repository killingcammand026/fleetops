import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { startLoading, setUsers } from "../../redux/slices/userSlice";
import { getAllUsersAPI } from "../../services/userService";

const FleetDrivers = () => {
  const dispatch = useDispatch();
  const { drivers } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchDrivers = async () => {
      dispatch(startLoading());
      const data = await getAllUsersAPI();
      dispatch(setUsers(data));
    };

    fetchDrivers();
  }, []);

  return (
    <DashboardLayout>
      <h2>Drivers</h2>

      {drivers.map((driver) => (
        <div key={driver._id} style={{ marginBottom: "10px" }}>
          <p>{driver.name}</p>
          <p>{driver.email}</p>
        </div>
      ))}
    </DashboardLayout>
  );
};

export default FleetDrivers;
