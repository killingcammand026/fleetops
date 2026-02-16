import api from "../lib/axios";

export const createCustomerAPI = async (data) => {
  const res = await api.post("/customers", data);
  return res.data;
};

export const getCustomerByIdAPI = async (id) => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};

export const updateCustomerAPI = async (id, data) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
};

export const updateCustomerLocationAPI = async (id, longitude, latitude) => {
  const res = await api.patch(`/customers/${id}`, {
    longitude,
    latitude,
  });
  return res.data;
};

export const deleteCustomerAPI = async (id) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};
