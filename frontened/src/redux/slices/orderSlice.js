import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    setOrders: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    },

    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },

    updateOrder: (state, action) => {
      state.orders = state.orders.map((o) =>
        o._id === action.payload._id ? action.payload : o
      );
    },

    removeOrder: (state, action) => {
      state.orders = state.orders.filter(
        (o) => o._id !== action.payload
      );
    },

    orderError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearOrderError: (state) => {
      state.error = null;
    },
  },
});

export const {
  startLoading,
  setOrders,
  addOrder,
  updateOrder,
  removeOrder,
  orderError,
  clearOrderError,
} = orderSlice.actions;

export default orderSlice.reducer;