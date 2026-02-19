import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Customer from "../models/Customer.model.js"
dotenv.config();

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