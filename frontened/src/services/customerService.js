import api from "../lib/axios";

const getAllCustomersAPI = async () => {
  const res = await api.get("/customers");
  return res.data;
};

const createCustomerAPI = async (data) => {
  const res = await api.post("/customers", data);
  return res.data;
};

const getCustomerByIdAPI = async (id) => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};

const updateCustomerAPI = async (id, data) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
};

const updateCustomerLocationAPI = async (id, longitude, latitude) => {
  const res = await api.put(`/customers/${id}/location`, {
    longitude,
    latitude,
  });
  return res.data;
};

const deleteCustomerAPI = async (id) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};

export {
  getAllCustomersAPI,
  createCustomerAPI,
  getCustomerByIdAPI,
  updateCustomerAPI,
  updateCustomerLocationAPI,
  deleteCustomerAPI,
};