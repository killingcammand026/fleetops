import Order from '../models/Order.model.js';
import Customer from "../models/Customer.model.js"
import Driver from "../models/Driver.model.js"
import dotenv from "dotenv"
dotenv.config();
import {    
    orderIdHelper,
    calculateDistanceHelper,
    calculateFareHelper
} from "../utils/Order.utils.js"
export const createOrderService=async(orderData,loggedInUser)=>{
    
    // console.log(process.env.BASE_FARE);
    delete orderData.customer;
    delete orderData.driver;
    delete orderData._id;
    delete orderData.orderId;
    if(loggedInUser.role!=="Customer"){
        throw new Error("Only customers can create orders");
    }
    const customer=await Customer.findOne({userId:loggedInUser.id});
    if(!customer){
         throw new Error("Customer profile Not found");
    }
    const {
        pickupLatitude,
        pickupLongitude,
        dropLatitude,
        dropLongitude,
        paymentMethod
    } =orderData;
const pickupLat = Number(pickupLatitude);
const pickupLon = Number(pickupLongitude);
const dropLat = Number(dropLatitude);
const dropLon = Number(dropLongitude);

    const distanceKm=calculateDistanceHelper(
        pickupLat,
        pickupLon,
        dropLat,
        dropLon
    );
    const estimateFare=calculateFareHelper(distanceKm);
    const orderId=orderIdHelper();
    console.log({
  pickupLat,
  pickupLon,
  dropLat,
  dropLon,
  distanceKm,
  estimateFare,
  BASE_FARE: process.env.BASE_FARE,
  PER_KM_RATE: process.env.PER_KM_RATE
});
    const order=await Order.create({
        orderId,
        customer:customer._id,
        pickupLocation:{
            type:"Point",
            coordinates:[pickupLon,pickupLat]
        },
        dropLocation:{
            type:"Point",
            coordinates:[dropLon,dropLat]
        },
        distanceKm,
        estimateFare,
        payment:{
            method:paymentMethod,
            amount:Number(estimateFare)
        }
    });
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
export const updateOrderService=async(orderId,updateData,loggedInUser)=>{
    const order=await Order.findById(orderId);
    if(!order){
          throw new Error("Order not found");
    }
    let allowedFields=[];
    if(loggedInUser.role==="Customer"){
        // console.log(order.customer.toString());
        // console.log(loggedInUser.id);
        const customer=await Customer.findById(order.customer.toString());
        //   console.log(customer.userId.toString());
        // console.log(loggedInUser.id);
        if(customer.userId.toString()!==loggedInUser.id){
            throw new Error("Not authorized to update this order");
        }
        allowedFields=[
            "payment",
            "notes"
        ];
    }
    if(loggedInUser.role==="Fleet Manager"||loggedInUser.role==="Admin"){
        allowedFields=[
            "driver",
            "status"
        ];
    }
    // 🔥 ADD STATUS VALIDATION HERE
        if (updateData.status) {

            const allowedTransitions = {
                CREATED: ["DRIVER_ASSIGNED", "CANCELLED"],
                DRIVER_ASSIGNED: ["PICKED_UP", "CANCELLED"],
                PICKED_UP: ["IN_TRANSIT"],
                IN_TRANSIT: ["DELIVERED"],
                DELIVERED: [],
                CANCELLED: []
            };

            if (!allowedTransitions[order.status].includes(updateData.status)) {
                throw new Error("Invalid status transition");
            }
        }
    const filteredOrderData={};
    for(let key of allowedFields){
        if(updateData[key]!==undefined){
            filteredOrderData[key]=updateData[key];
        }
    }

    Object.assign(order,filteredOrderData);
    await order.save();
    return order;
};
export const deleteOrderService=async(orderId)=>{
    const order=await Order.findByIdAndDelete(orderId);
    if(!order){
        throw new Error("Failed to delete order");
    }
    return order;
};
export const updateOrderStatusService = async (
  orderId,
  newStatus,
  loggedInUser
) => {

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  //STATUS TRANSITION CONTROL
  const allowedTransitions = {
    CREATED: ["DRIVER_ASSIGNED", "CANCELLED"],
    DRIVER_ASSIGNED: ["PICKED_UP", "CANCELLED"],
    PICKED_UP: ["IN_TRANSIT"],
    IN_TRANSIT: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: []
  };
//   console.log(allowedTransitions[order.status]);
//   console.log(newStatus);
  if (!allowedTransitions[order.status].includes(newStatus)) {
    throw new Error("Invalid status transition");
  }

  //ROLE-BASED CONTROL

  //DRIVER_ASSIGNED by Only Admin / Fleet Manager
  if (newStatus === "DRIVER_ASSIGNED") {
    if (
      loggedInUser.role !== "Admin" &&
      loggedInUser.role !== "Fleet Manager"
    ) {
      throw new Error("Only Admin or Fleet Manager can assign driver");
    }

    if (!order.driver) {
      throw new Error("Driver must be assigned before changing status");
    }
  }

  //PICKED_UP / IN_TRANSIT / DELIVERED → Only assigned driver
  if (
    newStatus === "PICKED_UP" ||
    newStatus === "IN_TRANSIT" ||
    newStatus === "DELIVERED"
  ) {
    if (loggedInUser.role !== "Driver") {
      throw new Error("Only driver can update this status");
    }

    const driver = await Driver.findById(order.driver);

    if (!driver) {
      throw new Error("Driver not found");
    }

    if (driver.userId.toString() !== loggedInUser._id.toString()) {
      throw new Error("You are not assigned to this order");
    }
  }

  //CANCELLED → Only Customer (who created order)
  if (newStatus === "CANCELLED") {
    if (loggedInUser.role !== "Customer") {
      throw new Error("Only customer can cancel order");
    }

    const customer = await Customer.findById(order.customer);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.userId.toString() !== loggedInUser._id.toString()) {
      throw new Error("You are not allowed to cancel this order");
    }
  }

  //UPDATE STATUS
  order.status = newStatus;

  if (newStatus === "PICKED_UP") {
    order.pickedUpAt = new Date();
  }

  if (newStatus === "DELIVERED") {
    order.deliveredAt = new Date();
  }

  await order.save();

  return order;
};
export const assignDriverService =async(orderId,driverId,loggedInUser)=>{
    const order=await Order.findById(orderId);
    if(!order){
        throw new Error("Order not found");
    }
    if(order.status!=="CREATED"){
        throw new Error("Driver can be assigned only to Created order status");
    }
        order.driver=driverId;
       
        await order.save();
        return await updateOrderStatusService(orderId,"DRIVER_ASSIGNED",loggedInUser);
};
export const cancelOrderService =async(orderId,loggedInUser)=>{
    const order=await Order.findById(orderId);
    if(!order){
        throw new Error("Order not found");
    }
    const customer=await Customer.findById(order.customer.toString());

    if(customer.userId.toString()!==loggedInUser._id.toString()){
        throw new Error("Not authorized to cancel this order");
    }
    if(order.status!=="CREATED"&&
        order.status!=="DRIVER_ASSIGNED"
    ){
        throw new Error("Order cannot be cancelled at this stage");
    }
    order.driver=null;
    await order.save();

    return await updateOrderStatusService(
        orderId,
        "CANCELLED",
        loggedInUser
    );

};
