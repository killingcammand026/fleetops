import axios from "axios";
import { logout } from "../redux/slices/authSlice";

// Create Axios instance
const api = axios.create({
<<<<<<< HEAD
  baseURL: "http://localhost:5000/api", // change to your backend URL
  withCredentials: true, // if using cookies
=======
  baseURL: "http://localhost:5000/api/test", 
  withCredentials: true, 
>>>>>>> 92db2ff50eb5fe9ef7af60f98cdaeda0e858eaf9
});
 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export const setupAxiosInterceptors = (store) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        store.dispatch(logout());
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }
  );
};

export default api;
