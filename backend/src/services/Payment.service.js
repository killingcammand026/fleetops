import crypto from "crypto";
import razorpay from "../config/Rajorpay.config.js"
import Order from "../models/Order.model.js"
import Customer from "../models/Customer.model.js"

export const createPaymentOrderService=async (orderId,loggedInUser)=>{

    const order=await Order.findById(orderId);
    if(!order){
        throw new Error("order not found");
    }
    if(order.payment.method==="COD"){
        throw new Error("COD does not need online Payment");
    }
    const customer=await Customer.findById(order.customer.toString());
    if(customer.userId.toString()!==loggedInUser._id.toString()){
         throw new Error("Not authorized for this order");
    }
    const options={
        amount:order.payment.amount*100,
        currency:order.payment.currency,
        receipt:order._id.toString(),
    };
    const razorpayOrder=await razorpay.orders.create(options);
    order.payment.transactionId=razorpayOrder.id;
    await order.save();
     if(!razorpayOrder){
        throw new Error("razorpayOrder not created");
    }
    return razorpayOrder;
};
export const verifyPaymentService=async (data)=>{
    const {razorpayOrderId,razorpayPaymentId,razorpaySignature}=data;

    const body=razorpayOrderId+"|"+razorpayPaymentId;

    const expectedSignature=crypto
            .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

    if(expectedSignature!==razorpaySignature){
        throw new Error("Invalid payment signature");
    }

    const order=await Order.findOne({
        "payment.transactionId":razorpayOrderId,
    });

    if(!order){
        throw new Error("order not found");
    }

    order.payment.status="COMPLETED";
    order.payment.razorpayPaymentId=razorpayPaymentId;
    order.payment.razorpaySignature=razorpaySignature;
    // order.payment.transactionId=razorpayPaymentId;
    order.payment.paidAt=new Date();

    await order.save();
    return order;
};
export const handleRazorpayWebhookService=async(rawBody,signature)=>{
    const webhookSecret=process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature=crypto
            .createHmac("sha256",webhookSecret)
            .update(rawBody)
            .digest("hex");
    if(signature!==expectedSignature){
        throw new Error("Invalid payment signature");
    }
    const event=JSON.parse(rawBody);

    const paymentEntity=event.payload?.payment?.entity;

    if(!paymentEntity) return;
    if(paymentEntity.order_id!==order.payment.razorpayOrderId){
        throw new Error("OrderId mismatch");
    }

    const order=await Order.findOne({
        "payment.razorpayPaymentId":paymentEntity.id
    });

    if(!order) return;
    if(order.payment.method==="COD"){
        throw new Error("COD does not need online Payment");
    }
    if(order.payment.status==="COMPLETED"){
        return order;
    }

    if(event.event==="payment.captured"){
        order.payment.status="COMPLETED";
        order.payment.paidAt=new Date();
         order.status="CREATED";
         order.statusHistory.push({
            status:"CREATED",
            updatedAt:new Date()
        })
    }
    if(event.event==="payment.failed"){
        order.payment.status="FAILED";
    }
    
    await order.save();
    return order;
    
};