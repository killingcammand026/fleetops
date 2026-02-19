import api from "../lib/axios";

const BASE = "/drivers";

export const createDriverAPI = async (data) => {
  const res = await api.post(BASE, data);
  return res;
};

export const getAllDriversAPI = async () => {
  const res = await api.get(BASE);
  return res;
};

export const getDriverByIdAPI = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res;
};

export const updateDriverAPI = async (id, data) => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res;
};

export const deleteDriverAPI = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res;
};

export const updateDriverLocationAPI = async (id, longitude, latitude) => {
  const res = await api.patch(`${BASE}/${id}`, { longitude, latitude });
  return res;
};
