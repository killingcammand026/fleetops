import jwt from "jsonwebtoken"
import User from "../models/User.model.js"

export const verifyTokenService=async (token)=>{
    try{
    //verify token
    const decoded=jwt.verify(token,process.env.JWT_SECRET);

    //fetch User
    const user=await User.findById(decoded.id).select("-password");

    if(!user){
        throw new Error("user not found");
    }
    return user;
   }
   catch(error){
        throw new Error("Invalid or Expired Token");
   }

};