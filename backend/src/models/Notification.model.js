import mongoose from 'mongoose';
const NotificationSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    type:String,
    message:String,
    createdAt:{
        type:Date,
        default:Date.now,
    },
    status:String, //e.g., Unread, Read, Archived
});
module.exports = mongoose.model("Notification",NotificationSchema);