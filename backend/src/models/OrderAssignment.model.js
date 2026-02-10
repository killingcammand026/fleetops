import mongoose from "mongoose";

const OrderAssignmentSchema = new mongoose.Schema({
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
       
    },
    driverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Driver",
    },
    assignedAt:{
        type:Date,
        default:Date.now,
    },
    assignedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    reason:String, //optional reason for assignment or reassignment
});
module.exports = mongoose.model("OrderAssignment",OrderAssignmentSchema);