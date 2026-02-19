import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    fleetManagerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",//role must be fleet manager
        required:true,
        index:true,
    },
    //driver personal info
    name:{
        type:String,
        required:true,
        trim:true ,
    },
    phone:{
        type:String,
        required:true,
        unique:true,
    },
    vehicle:{
        type:{
            type:String,
            enum:["Car","Bike","Van","Truck"],
            required:true,
        },
        registrationNumber:{
            type:String,
            required:true,
            unique:true,
            
        },
        capacityKg:Number,
    },
    liveLocation:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point",
        },
        coordinates:{
            type:[Number], // [longitude, latitude]
            required:true,
        },
    },

    //availability status
    status:{
        type:String,
        enum:["Available","On_Trip","Offline"],
        default:"Offline"
    },
    //kyc & verification

    isVerified:{
        type:Boolean,
        default:false   
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    licenceNumber:String,
    licenceExpiryDate:Date,

    //performance metrics
    rating:{
        type:Number,
        default:5,
        min:1,
        max:5,
    },
    totalTrips:{
        type:Number,
        default:0
    },


},{timestamps:true});
// Geo index (explicit)
DriverSchema.index({ liveLocation: "2dsphere" });
export default mongoose.model("Driver",DriverSchema);