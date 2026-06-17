import { createSlice, current } from "@reduxjs/toolkit";

const initialState={
    currentCustomer:null,
    loading:false,
    error:null,
};


const customerSlice=createSlice({
    name:"customer",
    initialState,
    reducers:{
        startLoading:(state)=>{
            state.loading=true;
            state.error=null;
        },

        setCustomer:(state,action)=>{
            state.loading=false;
            state.currentCustomer=action.payload;
        },

        customerError:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },  

        clearCustomer:(state)=>{
            state.currentCustomer=null;
            state.loading=false;
            state.error=null;
        },
    },
});



export const {
  startLoading,
  setCustomer,
  customerError,
  clearCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;