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
            const token = action.payload.token;
            let decoded;
            
            try {
                decoded = jwtDecode(token);
            } catch (err) {
                // If token decode fails, use the user data from response
                decoded = action.payload.user || action.payload;
            }

            state.loading = false;
            state.error = null;
            state.token = token;
            state.user = decoded;
            state.role = decoded.role || action.payload.role;
            state.isAuthenticated = true;

            localStorage.setItem("token", token);

            if (decoded.role === "Driver" || action.payload.role === "Driver") {
                localStorage.setItem("driverId", decoded._id || action.payload.user?._id);
            }
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
            let decoded;
            
            try {
                decoded = jwtDecode(token);
            } catch (err) {
                // If token decode fails, use the user data from response
                decoded = action.payload.user || action.payload;
            }

            state.loading = false;
            state.token = token;
            state.user = decoded;
            state.role = decoded.role || action.payload.role;
            state.isAuthenticated = true;

            localStorage.setItem("token", token);

            if (decoded.role === "Driver" || action.payload.role === "Driver") {
                localStorage.setItem("driverId", decoded._id || action.payload.user?._id);
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