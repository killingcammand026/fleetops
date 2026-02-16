import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startLoading,
  setUsers,
  userError,
} from "../../redux/slices/userSlice";
import { getAllUsersAPI, deleteUserAPI } from "../../services/userService.js";


const UsersPage = () => {
    const dispatch=useDispatch();
    const {users,loading,error}=useSelector((state)=>state.user);   

    useEffect(()=>{
        const fetchUsers=async ()=>{
            try{
                dispatch(startLoading());
                const data=await getAllUsersAPI();
                dispatch(setUsers(data));
            }
            catch(err){
                dispatch(userError(err.response?.data?.message || "Failed to load users"));
            }
        };

        fetchUsers();
    },[dispatch]);


    const handleDelete = async (id) => {
  try {
    await deleteUserAPI(id);
    dispatch(setUsers(users.filter((u) => u._id !== id)));
  } catch (err) {
    dispatch(userError("Failed to delete user"));
  }
};

    if (loading) return <div>Loading...</div>;

     return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>

      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center border-t">
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.phone}</td>
              <td>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="text-red-600"
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

export default UsersPage;
