import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startLoading,
  setCustomer,
  customerError,
} from "../../redux/slices/customerSlice";
import { getCustomerByIdAPI } from "../../services/customerService";

import CustomerLocationUpdater from "./CustomerLocationUpdater";
 

const CustomerDashboard=()=>{
    const dispatch=useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {currentCustomer,loading}=useSelector((state)=>state.customer
);

useEffect(()=>{
    const fetchCustomer=async()=>{
        try{
            dispatch(startLoading());
            const data=await getCustomerByIdAPI(user.id);
            dispatch(setCustomer(data));
        }catch(err){
            dispatch(customerError(err.response?.data?.message || "Failed to load customer data"));
        }
    };

    fetchCustomer();
}, [dispatch, user.id]);

if(loading || !currentCustomer) return <div>Loading...</div>;

 return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome {currentCustomer?.address}
      </h1>

      <div>
        <p><strong>Payment Method:</strong> {currentCustomer?.paymentMethod?.method}</p>
        <p><strong>Address:</strong> {currentCustomer?.address}</p>
      </div>

      <CustomerLocationUpdater />
    </div>
  );
};

export default CustomerDashboard;