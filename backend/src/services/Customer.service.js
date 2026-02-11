import Customer from "../models/Customer.model.js";

export const createCustomerService=async(customerData)=>{
    const customer=await Customer.create(customerData);
    if(!customer) {
        throw new Error('Customer not created');
    }
    return customer;
};
export const getAllCustomersService=async()=>{
    const customers=await Customer.find();
    if(!customers || customers.length === 0) {
        throw new Error('Customers not found');
    }
    return customers;
};
export const getCustomerByIdService=async(id)=>{
    const customer=await Customer.findById(id);
    if(!customer){
        throw new Error('Customer not found');
    }
    return customer;
};
export const updateCustomerService=async(id,customerData)=>{
    const customer=await Customer.findByIdAndUpdate(id,customerData,{new:true});
    if(!customer) {
        throw new Error('Customer not found');
    }
    return customer;
};
export const deleteCustomerService=async(id)=>{
    const customer=await customer.findByIdAndDelete(id);
    if(!customer) {
        throw new Error('Customer not found');
    }
    return customer;
};
export const updateCustomerLocationService=async(id,longitude,latitude)=>{
    const customer=await Customer.findByIdAndUpdate(id,{
        defaultLocation:{
            type:"point",
            coordinates:[longitude,latitude], // [longitude, latitude]
        }
    },{new:true});
    if(!customer) {
        throw new Error('Customer not found');
    }
    return customer;
};

