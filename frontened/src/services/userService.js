import api from "../lib/axios";

export const getAllUsersAPI = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const getUserByIdAPI = async (id) => {
  const res = await api.get(`/users/${id}`);
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
