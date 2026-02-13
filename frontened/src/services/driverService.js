import api from "../lib/axios";

const BASE="/drivers";

export const createDriverAPI = (data) =>
  api.post(BASE, data);


export const getAllDriversAPI = () =>
  api.get(BASE);


export const getDriverByIdAPI = (id) =>
  api.get(`${BASE}/${id}`);


export const updateDriverAPI = (id, data) =>
  api.put(`${BASE}/${id}`, data);


export const deleteDriverAPI = (id) =>
  api.delete(`${BASE}/${id}`);


export const updateDriverLocationAPI = (id, longitude, latitude) =>
  api.patch(`${BASE}/${id}`, {
    longitude,
    latitude,
  });