import mongoose from 'mongoose';
const PaymentTransactionSchema = new mongoose.Schema({
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
    },
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Customer",
    },
    provider:String, //e.g., Stripe, PayPal
    status:String, //e.g., Pending, Completed, Failed
    amount:Number,
    currency:String,
});
export default mongoose.model("PaymentTransaction",PaymentTransactionSchema);