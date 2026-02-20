import api from "../lib/axios";

export const getAllOrdersAPI = async () => {
  const res = await api.get("/orders");
  return res.data;
};

export const getOrderByIdAPI = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const createOrderAPI = async (data) => {
  const res = await api.post("/orders", data);
  return res.data;
};

export const updateOrderAPI = async (id, data) => {
  const res = await api.put(`/orders/${id}`, data);
  return res.data;
};

export const deleteOrderAPI = async (id) => {
  const res = await api.delete(`/orders/${id}`);
  return res.data;
};

export const assignDriverAPI = async (orderId, driverId) => {
  const res = await api.patch(`/orders/${orderId}/assign-driver`, { driverId });
  return res.data;
};

export const updateStatusAPI = async (id, status) => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data;
};

export const cancelOrderAPI = async (id) => {
  const res = await api.patch(`/orders/${id}/cancel`);
  return res.data;
};

export const driverAcceptAPI = async (id) => {
  const res = await api.patch(`/orders/${id}/driver-accept`);
  return res.data;
};

export const driverRejectAPI = async (id) => {
  const res = await api.patch(`/orders/${id}/driver-reject`);
  return res.data;
};