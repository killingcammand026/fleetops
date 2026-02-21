import { createPaymentOrderService,verifyPaymentService,handleRazorpayWebhookService } from "../services/Payment.service.js";

export const createPaymentController=async(req,res)=>{
    try{
        const razorpayOrder=await createPaymentOrderService(
            req.params.id,
            req.user._id
        );
        res.status(200).json({
            success:true,
            razorpayOrder
        })
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        });
    }
};
export const verifyPaymentController=async(req,res)=>{
    try{
        const razorpayOrder=await verifyPaymentService(req.body);
        res.status(200).json({
            success:true,
            message:"Payment verified successfully",
            razorpayOrder
        })
    }catch(error){
        res.status(400).json({message:error.message});
    }
};
export const handleRazorpayWebhookController=async (req,res)=>{
    try{
         console.log(req.body);
         res.status(200).json({ status: "ok" });
         
        const signature=req.headers["x-razorpay-signature"];
        const razorpayOrder=await handleRazorpayWebhookService(req.body,signature);
        res.status(200).json({
            received:true,
            razorpayOrder:razorpayOrder
        });
    }catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
};