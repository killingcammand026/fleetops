import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import driverReducer from "./slices/driverSlice";
import { setupAxiosInterceptors } from "../lib/axios";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driver: driverReducer,
    orders: orderReducer,
  },
});

// Attach interceptors after store creation
setupAxiosInterceptors(store);
