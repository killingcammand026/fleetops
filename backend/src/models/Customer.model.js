import mongoose from "mongoose";
const CustomerSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:false,
    },
    phone:{
        type:String,
        required:false,
        
    },
    defaultLocation:{
        type:{
            type:String,
            enum:["Point"],
            
        },
        coordinates:{
            type:[Number], // [longitude, latitude]
            required:false,
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
