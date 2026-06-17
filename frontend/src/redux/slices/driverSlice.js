import { createSlice } from "@reduxjs/toolkit"; 

const initialState={
    drivers:[],
    currentDriver:null,
    loading:false,
    error:null,
};

const driverSlice=createSlice({
    name:"driver",
    initialState,
    reducers:{
     startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    setDrivers: (state, action) => {
      state.loading = false;
      state.drivers = action.payload;
    },

    addDriver: (state, action) => {
      state.drivers.push(action.payload);
      state.loading = false;
    },

    setCurrentDriver: (state, action) => {
      state.currentDriver = action.payload;
       state.loading = false;
    },

      updateDriver: (state, action) => {
      state.currentDriver = action.payload;
    },

     deleteDriverFromState: (state, action) => {
      state.drivers = state.drivers.filter(
        (d) => d._id !== action.payload
      );
    },

          driverError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

      resetDriver: () => initialState,
  
},

});



export const {
  startLoading,
  setDrivers,
  addDriver,
  setCurrentDriver,
  updateDriver,
  deleteDriverFromState,
  driverError,
  resetDriver,
} = driverSlice.actions;

export default driverSlice.reducer;