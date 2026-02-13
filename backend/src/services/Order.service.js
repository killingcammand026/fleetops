import Order from '../models/Order.model.js';

export const createOrderService=async(orderData)=>{
    const order=await Order.create(orderData);
    if(!order){
        throw new Error("Failed to create order");
    }
    return order;
};
export const getAllOrdersService=async()=>{
    const orders=await Order.find()
    .populate("customer")
    .populate("driver");
    if(!orders){
        throw new Error("Failed to fetch orders");
    }
    return orders;
};
export const getOrderByIdService=async(orderId)=>{
    const order=await Order.findById(orderId)
    .populate("customer")
    .populate("driver");
    if(!order){
        throw new Error("Failed to fetch order");
    }
    return order;
};
export const updateOrderService=async(orderId,updateData)=>{
    const order=await Order.findByIdAndUpdate(orderId,updateData,{new:true});
    if(!order){
        throw new Error("Failed to update order");
    }
    return order;
};
export const deleteOrderService=async(orderId)=>{
    const order=await Order.findByIdAndDelete(orderId);
    if(!order){
        throw new Error("Failed to delete order");
    }
    return order;
};