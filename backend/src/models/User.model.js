import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    provider: {
  type: String,
  enum: ["local", "google"],
  default: "local",
    },

      password: {
  type: String,
  required: function () {
    return this.provider === "local";
  },
},
    role:{
        type:String,
        enum:["Admin","Fleet Manager","Driver","Customer"],
        default:"Customer"
    },
    phone:String,
    isActive:{
        type:Boolean,
        default:true
    },
    resetOtp:{
        type:String,
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date,
    }


},{timestamps:true});

//pre-save hook to hash password
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return ;
    try{
        const salt=await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);
        return;
    }
    catch(error){
        throw new Error("Error hashing password");
    }
});
//compare password method
userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

export default mongoose.model("User",userSchema);