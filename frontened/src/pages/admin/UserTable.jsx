import {
  deleteUserAPI,
  updateUserRoleAPI,
} from "../../services/userService";
import { useDispatch } from "react-redux";
import { deleteUser, updateUser, userError } from "../../redux/slices/userSlice";

const UserTable = ({ users, onMakeDriver, refresh }) => {
  const dispatch = useDispatch();

  const handleDelete = async (id) => {
    try {
      await deleteUserAPI(id);
      dispatch(deleteUser(id));
    } catch (err) {
      dispatch(userError(err.response?.data?.error));
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (newRole === "Driver") {
      onMakeDriver?.(user);
      return;
    }
    try {
      const updated = await updateUserRoleAPI(user._id, newRole);
      dispatch(updateUser(updated));
    } catch (err) {
      dispatch(userError(err.response?.data?.error));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-3">

        {/* Table Header */}
        <thead>
          <tr className="text-gray-700 text-lg">
            <th className="px-4">Name</th>
            <th className="px-4">Email</th>
            <th className="px-4">Role</th>
            <th className="px-4 text-center">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className="bg-white shadow-sm hover:shadow-md transition rounded-xl"
            >
              {/* Name */}
              <td className="px-4 py-4 font-medium text-gray-800 rounded-l-xl">
                {user.name}
              </td>

              {/* Email */}
              <td className="px-4 py-4 text-gray-600">
                {user.email}
              </td>

              {/* Role Dropdown */}
              <td className="px-4 py-4">
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(user, e.target.value)
                  }
                  className="px-4 py-2 bg-white border border-blue-400 
                  rounded-lg shadow-sm text-gray-700 font-medium
                  focus:ring-2 focus:ring-blue-300 outline-none
                  transition duration-200 hover:border-blue-600"
                >
                  <option value="Admin">Admin</option>
                  <option value="Fleet Manager">FleetManager</option>
                  <option value="Driver">Driver</option>
                  <option value="Customer">Customer</option>
                </select>
              </td>

              {/* Delete Button */}
              <td className="px-4 py-4 text-center rounded-r-xl">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="px-5 py-2 bg-red-500 text-white font-semibold 
                  rounded-lg shadow hover:bg-red-600 
                  hover:scale-105 transition-all duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default UserTable;