import Order from '../models/Order.model.js';
import Customer from "../models/Customer.model.js"
import Driver from "../models/Driver.model.js"
import dotenv from "dotenv"
import {getIO} from "../sockets/index.socket.js"
// import { setTimeout } from 'timers/promises';
import mongoose from 'mongoose';
dotenv.config();
import {    
    orderIdHelper,
    calculateDistanceHelper,
    calculateFareHelper
} from "../utils/Order.utils.js"
import { orderQueue } from '../queues/order.queue.js';
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
//     console.log({
//   pickupLat,
//   pickupLon,
//   dropLat,
//   dropLon,
//   distanceKm,
//   estimateFare,
//   BASE_FARE: process.env.BASE_FARE,
//   PER_KM_RATE: process.env.PER_KM_RATE
// });
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
    DRIVER_ASSIGNED: ["DRIVER_ACCEPTED", "CANCELLED"],
    DRIVER_ACCEPTED:["PICKED_UP","CANCELLED"],
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
  if(newStatus==="DRIVER_ASSIGNED"){
    await Driver.findByIdAndUpdate(order.driver,{
        isAvailable:false
    });
  }
  if(newStatus==="DELIVERED"||newStatus==="CANCELLED"){
    await Driver.findByIdAndUpdate(order.driver,{
        isAvailable:true
    });
  }
  if (newStatus === "PICKED_UP") {
    order.pickedUpAt = new Date();
  }

  if (newStatus === "DELIVERED") {
    order.deliveredAt = new Date();
  }

  await order.save();

  //emit status update to order room
  const io=getIO();
  io.to(`order_${order._id}`.emit("statusUpdated",{
    orderId:order._id,
    status:order.status
  }));

  return order;
};
export const assignDriverService = async (orderId) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const io = getIO();

        let order = await Order.findById(orderId).session(session);

        if (!order) throw new Error("Order not found");

        if (!["CREATED", "DRIVER_ASSIGNED"].includes(order.status))
            throw new Error("Driver can be assigned only to CREATED order");

        // ✅ FIXED CONDITION
        if (order.retryCount >= order.maxRetries) {
            order.status = "CANCELLED";
            await order.save({ session });

            await session.commitTransaction();
            session.endSession();

            io.to(`order_${orderId}`).emit("orderCancelled", {
                orderId: order._id,
                reason: "No drivers accepted the order"
            });

            return order;
        }

        const nearestDriver = await Driver.findOne({
            _id: { $nin: order.rejectedDrivers },
            isAvailable: true,
            liveLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: order.pickupLocation.coordinates
                    },
                    $maxDistance: Number(process.env.maxDistance)
                }
            }
        }).session(session);

        if (!nearestDriver) {
            order.status = "CANCELLED";
            await order.save({ session });

            await session.commitTransaction();
            session.endSession();

            io.to(`order_${orderId}`).emit("orderCancelled", {
                orderId: order._id,
                reason: "No available drivers nearby"
            });

            return order;
        }

        // ✅ increment AFTER validation
        order.retryCount += 1;
        order.driver = nearestDriver._id;
        order.status = "DRIVER_ASSIGNED";

        nearestDriver.isAvailable = false;

        await order.save({ session });
        await nearestDriver.save({ session });

        await session.commitTransaction();
        session.endSession();

        io.to(`order_${orderId}`).emit("driverAssigned", {
            orderId: order._id,
            driverId: nearestDriver._id
        });

        // ✅ schedule timeout again
        await orderQueue.add(
            "order-timeout",
            {
                orderId,
                previousDriverId: nearestDriver._id
            },
            {
                delay: 5000
            }
        );

        return order;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const cancelOrderService =async(orderId,loggedInUser)=>{
    let order=await Order.findById(orderId);
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

    order.status="CANCELLED";
    await order.save();
        const io=getIO();
        io.to(`order_${orderId}`).emit("orderCancelled",{
            orderId:order._id
        });
        return order;
};
export const driverAcceptOrderService=async(orderId,loggedInUser)=>{
    const order=await Order.findById(orderId);
    if(!order){
        throw new Error("Order Not Found");
    }
    const driver=await Driver.findById(order.driver);
    if(!driver){
        throw new Error("Driver not found"); 
    }
    if(driver.userId.toString()!==loggedInUser._id.toString()){
        throw new Error("Not your Assigned Order");

    }
    if(order.status!=="DRIVER_ASSIGNED"){
        throw new Error("Order not in Assigned State")
    }


    order.status="DRIVER_ACCEPTED";
    await order.save();
    return order;

};
export const driverRejectOrderService=async(orderId,loggedInUser)=>{
    const order=await Order.findById(orderId);
    if(!order){
        throw new Error("Order Not Found");
    }
    const driver=await Driver.findById(order.driver);
    if(!driver){
        throw new Error("Driver not found"); 
    }
    if(driver.userId.toString()!==loggedInUser._id.toString()){
        throw new Error("Not your Assigned Order");

    }
    if(order.status!=="DRIVER_ASSIGNED"){
        throw new Error("Order not in Assigned State")
    }
     driver.isAvailable = true;
     await driver.save();

    order.driver=null;
    order.status="CREATED";
    await order.save();

    return await assignDriverService(orderId,loggedInUser,[driver._id]);

};