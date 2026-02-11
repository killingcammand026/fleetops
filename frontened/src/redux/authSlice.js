import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { LogOut } from "lucide-react";


const token=localStorage.getItem("token");

let user=null;
let role=null;

if(token){
    const decoded=jwtDecode(token);
    user=decoded;
    role=decoded.role;
}

const initialState={
    user,
    role,
    token,
    isAuthenticated: !!token,
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
            const token=action.payload.token;
            const decoded=jwtDecode(token);

            state.loading=false;
            state.token=token;
            state.user=decoded;
            state.role=decoded.role;
            state.isAuthenticated=true;

            localStorage.setItem("token",token);
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
        },
    },
});

export const {startLoading,registerSuccess,registerFailure,logout,}=authSlice.actions;
export default authSlice.reducer;