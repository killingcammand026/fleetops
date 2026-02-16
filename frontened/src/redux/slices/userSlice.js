import { createSlice } from "@reduxjs/toolkit";

const initialState={
    users:[],
    currentUser:null,
    loading:false,
    error:null,
};

const userSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
        startLoading:(state)=>{
            state.loading=true;
            state.error=null;
        },

        setUsers: (state, action) => {
          state.loading = false;
          state.users = action.payload;
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


export const {startLoading,setUsers,setCurrentUser,userError}=userSlice.actions;

export default userSlice.reducer;