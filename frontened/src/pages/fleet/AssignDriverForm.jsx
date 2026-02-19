import { useDispatch, useSelector } from "react-redux";
import { addAssignment } from "../../redux/slices/assignmentSlice";

const AssignDriverForm = ({ orderId }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  const drivers = users.filter((u) => u.role === "Driver");

  const handleAssign = (driverId) => {
    const newAssignment = {
      _id: Date.now().toString(),
      orderId,
      driverId,
      fleetManagerId: user._id,
      status: "Assigned",
    };

    dispatch(addAssignment(newAssignment));
  };

  return (
    <div>
      <h4>Assign Driver</h4>

      {drivers.map((driver) => (
        <div key={driver._id}>
          {driver.name}
          <button onClick={() => handleAssign(driver._id)}>
            Assign
          </button>
        </div>
      ))}
    </div>
  );
};

export default AssignDriverForm;
