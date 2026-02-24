import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Customer from "../models/Customer.model.js"
dotenv.config();
// import admin from "../config/firebaseAdmin.js";
// import jwt from "jsonwebtoken";
// import User from "../models/User.model.js";


// export const googleAuthService=async(token)=>{
    
//         if (!token) {
//          throw new Error("To authenticate provide token");
//         }
    
//         const decoded = await admin.auth().verifyIdToken(token);
//         const { email, name } = decoded;
    
//         let user = await User.findOne({ email });
    
//         // If not exist → create REAL google user
//         if (!user) {
//           user = await User.create({
//             name,
//             email,
//             provider: "google",
//             role: "Customer",
//           });
    
//           await Customer.create({
//             userId: user._id,
//             name: user.name,
//           });
//         }
    
//         // If exists but local user
//         if (user.provider === "local") {
         
//            throw new Error ("Email registered with password. Please login normally.");
         
//         }
    
//         const jwtToken = jwt.sign(
//           { id: user._id, role: user.role },
//           process.env.JWT_SECRET,
//           { expiresIn: process.env.JWT_EXPIRES_IN }
//         );
//         return {user,jwtToken};
    
// };

export const registerService=async(name,email,password)=>{
    const existingUser=await User.findOne({email});
    if(existingUser){
        throw new Error("Email already in use");
    }
    const user=await User.create({name,email,password});
    if(!user){
        throw new Error("Failed to register user");
    }
    if(user.role==="Customer"){
        await Customer.create({
            userId:user._id,
            name:user.name,
           
        });
    }
    return user;
};
export const loginService=async(email,password)=>{
    const user=await User.findOne({email});
    if(!user){
        throw new Error("Invalid email or password");
    }
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        throw new Error("Invalid email or password");
    }
    const token=jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
    return {user,token};
};