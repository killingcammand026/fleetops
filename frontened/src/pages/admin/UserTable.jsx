import {
  deleteUserAPI,
  updateUserRoleAPI,
} from "../../services/userService";
import { useDispatch } from "react-redux";
import { deleteUser, updateUser, userError } from "../../redux/slices/userSlice";

const UserTable = ({ users, refresh }) => {
  const dispatch = useDispatch();

  const handleDelete = async (id) => {
    try {
      await deleteUserAPI(id);
      dispatch(deleteUser(id));
    } catch (err) {
      dispatch(userError(err.response?.data?.error));
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await updateUserRoleAPI(id, role);
      dispatch(updateUser(updated));
    } catch (err) {
      dispatch(userError(err.response?.data?.error));
    }
  };

  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              <select
                value={user.role}
                onChange={(e) =>
                  handleRoleChange(user._id, e.target.value)
                }
              >
                <option value="Admin">Admin</option>
                <option value="Fleet Manager">FleetManager</option>
                <option value="Driver">Driver</option>
                <option value="Customer">Customer</option>
              </select>
            </td>

            <td>
              <button onClick={() => handleDelete(user._id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
