import mongoose from "mongoose";
const CustomerSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    defaultLocation:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point",
        },
        coordinates:{
            type:[Number], // [longitude, latitude]
            index:"2dsphere"
        }
    },
    paymentMethod:{
        method:{
        type:String,
        enum:["Credit Card","UPI","COD","Wallet"],
        default:"COD",
        required:true,
        },
        upiId:String,
        cardLast4Digits:String,
        cardBrand:String,
       
        isDefault:{
            type:Boolean,
            default:true
        },
    },
},{timestamps:true});

CustomerSchema.index({defaultLocation:"2dsphere"});
module.exports = mongoose.model("Customer",CustomerSchema);
