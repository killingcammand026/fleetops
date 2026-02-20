import { createSlice } from "@reduxjs/toolkit";

const initialState={
    users:[],
    drivers: [],
  fleetManagers: [],
  admins: [],
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
        startLoading:(state)=>{
            state.loading=true;
            state.error=null;
        },

        clearError: (state) => {
           state.error = null;
        },

        setUsers: (state, action) => {
          state.loading = false;
          state.users = action.payload;
        
           state.drivers = action.payload.filter(
        (user) => user.role === "Driver"
      );

      state.fleetManagers = action.payload.filter(
        (user) => user.role === "Fleet Manager"
      );

      state.admins = action.payload.filter(
        (user) => user.role === "Admin"
      );
    },


      clearCurrentUser: (state) => {
      state.currentUser = null;
    },



     addUser: (state, action) => {
      state.users.push(action.payload);

      if (action.payload.role === "Driver") {
        state.drivers.push(action.payload);
      }

      if (action.payload.role === "Fleet Manager") {
        state.fleetManagers.push(action.payload);
      }

      if (action.payload.role === "Admin") {
        state.admins.push(action.payload);
      }
    },



       updateUser: (state, action) => {
      const updatedUser = action.payload;

      state.users = state.users.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      );

      
      state.drivers = state.users.filter((u) => u.role === "Driver");
      state.fleetManagers = state.users.filter(
        (u) => u.role === "Fleet Manager"
      );
      state.admins = state.users.filter((u) => u.role === "Admin");
    },
    

     deleteUser: (state, action) => {
      const userId = action.payload;

      state.users = state.users.filter((user) => user._id !== userId);

      state.drivers = state.users.filter((u) => u.role === "Driver");
      state.fleetManagers = state.users.filter(
        (u) => u.role === "Fleet Manager"
      );
      state.admins = state.users.filter((u) => u.role === "Admin");
    },

        

        setCurrentUser:(state,action)=>{
            state.loading=false;
            state.currentUser=action.payload;
        },

        userError:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
    },
});


export const {startLoading,
  setUsers,
  setCurrentUser,
  clearCurrentUser,
  addUser,
  updateUser,
  deleteUser,
  userError,
  clearError,}=userSlice.actions;

export default userSlice.reducer;