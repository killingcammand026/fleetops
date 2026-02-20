import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  startLoading,
  setUsers,
  addUser,
  userError,
} from "../../redux/slices/userSlice";

import {
  getAllUsersAPI,
  createFleetManagerAPI,
} from "../../services/userService";

import UserTable from "./UserTable";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchUsers = async () => {
    try {
      dispatch(startLoading());
      const data = await getAllUsersAPI();
      dispatch(setUsers(data));
    } catch (err) {
      dispatch(userError(err.response?.data?.error));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateFleetManager = async (e) => {
    e.preventDefault();

    try {
      dispatch(startLoading());

      const newUser = await createFleetManagerAPI(formData);

      dispatch(addUser(newUser)); // update redux
      setShowForm(false);
      setFormData({ name: "", email: "", password: "" ,});

    } catch (err) {
      dispatch(userError(err.response?.data?.error));
    }
  };

  return (
    <DashboardLayout>
      <h2>Admin Dashboard</h2>

    
      <button onClick={() => setShowForm(!showForm)}>
        Create Fleet Manager
      </button>

     
      {showForm && (
        <form onSubmit={handleCreateFleetManager} style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button type="submit">Create</button>
        </form>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <UserTable users={users} refresh={fetchUsers} />
    </DashboardLayout>
  );
};

export default AdminDashboard;
