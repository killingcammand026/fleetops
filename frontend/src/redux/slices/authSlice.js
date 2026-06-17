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
        // When store rehydrates from storage, never restore loading: true so login button is always usable
        ["persist/REHYDRATE"]: (state, action) => {
            if (action.payload?.auth) {
                state.loading = false;
            }
        },
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
                decoded = action.payload.user || action.payload;
            }
            const backendUser = action.payload.user || action.payload;
            const role = backendUser?.role ?? decoded?.role ?? action.payload.role;

            state.loading = false;
            state.error = null;
            state.token = token;
            state.user = backendUser && (backendUser.name != null || backendUser.email != null)
                ? { ...backendUser, id: backendUser._id ?? backendUser.id ?? decoded?.id, role }
                : { ...decoded, name: decoded?.name, email: decoded?.email, role };
            state.role = role;
            state.isAuthenticated = true;

            localStorage.setItem("token", token);

            if (role === "Driver") {
                localStorage.setItem("driverId", state.user._id ?? state.user.id ?? decoded?._id);
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
                decoded = action.payload.user || action.payload;
            }
            const backendUser = action.payload.user || action.payload;
            const role = backendUser?.role ?? decoded?.role ?? action.payload.role;

            state.loading = false;
            state.token = token;
            state.user = backendUser && (backendUser.name != null || backendUser.email != null)
                ? { ...backendUser, id: backendUser._id ?? backendUser.id ?? decoded?.id, role }
                : { ...decoded, name: decoded?.name, email: decoded?.email, role };
            state.role = role;
            state.isAuthenticated = true;

            localStorage.setItem("token", token);

            if (role === "Driver") {
                localStorage.setItem("driverId", state.user._id ?? state.user.id ?? decoded?._id);
            }
        },

        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Reset login form state (e.g. when mounting Login page) so button shows "Login" and is clickable
        resetLoginForm: (state) => {
            state.loading = false;
            state.error = null;
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
  resetLoginForm,
} = authSlice.actions;
export default authSlice.reducer;