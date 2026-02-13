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
            required:true,
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
export default mongoose.model("Customer",CustomerSchema);
