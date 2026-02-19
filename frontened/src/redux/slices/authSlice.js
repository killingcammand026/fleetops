import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";


const token = localStorage.getItem("token");

let user = null;
let role = null;
let isAuthenticated = false;

if (token) {
  try {
    const decoded = jwtDecode(token);
    user = decoded;
    role = decoded.role;
    isAuthenticated = true;
  } catch {
    localStorage.removeItem("token");
  }
}

const initialState={
    user,
    role,
    token,
    isAuthenticated,
    loading:false,
    error:null,
};


const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        //actions
        startLoading:(state)=>{
            state.loading=true;
            state.error=null;
        },

        registerSuccess:(state,action)=>{

            state.loading=false;
            state.error=null;

        },

        registerFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

        logout:(state)=>{
                state.user = null;
                state.role = null;
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem("token");
                localStorage.removeItem("driverId");
                
        },

        loginSuccess: (state, action) => {
            const token = action.payload.token;
            const decoded = jwtDecode(token);

            state.loading = false;
            state.token = token;
            state.user = decoded;
            state.role = decoded.role;
            state.isAuthenticated = true;

            localStorage.setItem("token", token);

            if (decoded.role === "Driver") {
         localStorage.setItem("driverId", decoded._id);
        }
        },

        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
  startLoading,
  registerSuccess,
  registerFailure,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions;
export default authSlice.reducer;