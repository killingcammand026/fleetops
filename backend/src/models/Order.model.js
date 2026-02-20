import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
    orderId:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Customer",
        required:true,
    },
    driver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Driver",
        default:null,
    },
    pickupLocation:{
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
    dropLocation:{
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
    //order lifecycle status
    status:{
        type:String,
        enum:["CREATED",
        "DRIVER_ASSIGNED",
        "DRIVER_ACCEPTED",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED"],
        default:"CREATED"
    },

    //payment info
    payment:{
        method:{
            type:String,
            enum:["Credit Card","UPI","COD","Wallet"],
            default:"COD",
            required:true,
        },
        status:{
            type:String,
            enum:["PENDING","COMPLETED","FAILED"],
            default:"PENDING"
        },
        amount:{
            type:Number,
            required:true,
        },
        transactionId:String,


    },

    //distance and pricing
    distanceKm:Number,
    estimateFare:Number,
    actualFare:Number,

    //timestamps for tracking
    pickedUpAt:Date,
    deliveredAt:Date,

    //optional metadata
    notes:String,

    rejectedDrivers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Driver",
             default: []
        }
    ],
    retryCount:{
        type:Number,
        default:0
    },
    maxRetries:{
        type:Number,
        default:3
    },
},{timestamps:true});

orderSchema.index({pickupLocation:"2dsphere"});
orderSchema.index({dropLocation:"2dsphere"});

export default mongoose.model("Order",orderSchema);