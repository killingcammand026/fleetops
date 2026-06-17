import api from "../lib/axios";

export const getAllUsersAPI = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const getUserByIdAPI = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const createUserAPI = async (data) => {
  const res = await api.post("/users", data);
  return res.data;
};

export const createFleetManagerAPI = async (data) =>{
  const res=await api.post("/users/create-fleet-manager", data);
  return res.data;
};

export const updateUserAPI = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUserAPI = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};


export const updateUserRoleAPI = async (id, role) =>{
  const res = await api.patch(`/users/${id}/role`, { role });
  return res.data;
};