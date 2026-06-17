import {
    registerService,
    loginService,
    
} from '../services/Auth.service.js';
import bcrypt from "bcrypt";
import admin from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Customer from "../models/Customer.model.js";
const signupOtpStore = new Map();
const verifiedSignupEmails = new Set();

import { sendOtpMail } from "../utils/mail.js";
export const googleAuthController = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const { email, name } = decoded;

    let user = await User.findOne({ email });

    // If not exist → create REAL google user
    if (!user) {
      user = await User.create({
        name,
        email,
        provider: "google",
        role: "Customer",
      });

      await Customer.create({
        userId: user._id,
        name: user.name,
      });
    }

    // If exists but local user
    if (user.provider === "local") {
      return res.status(400).json({
        message: "Email registered with password. Please login normally.",
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: "Google login successful",
      user,
      token: jwtToken,
    });

  } catch (error) {
    res.status(401).json({
      message: "Google authentication failed",
    });
  }
};



// export const registerController=async(req,res)=>{
//     const {name,email,password}=req.body;
//     try{
//         const user=await registerService(name,email,password);
//         res.status(201).json(user);
//     }
//     catch(error){
//         res.status(400).json({error:error.message});
//     }
// };


export const registerController = async (req, res) => {
    const { name, email, password } = req.body;

    try {

        if (!verifiedSignupEmails.has(email)) {
            return res.status(400).json({
                message: "Please verify OTP first",
            });
        }

        const user = await registerService(
            name,
            email,
            password
        );

        verifiedSignupEmails.delete(email);

        res.status(201).json(user);

    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};


export const loginController=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const {user,token}=await loginService(email,password);
        res.status(201).json({
             message: "Login successful:",
             user,
             token
            });
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};


export const sendOtp=async (req,res)=>{
    try{
        const {email}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const otp=Math.floor(1000+Math.random()*9000).toString();
        user.resetOtp=otp;
        user.otpExpires=Date.now()+5*60*1000;
        user.isOtpVerified=false;
        await user.save();
        await sendOtpMail(email,otp);
        res.status(200).json({message:"OTP sent to email"});
    }catch(error){
        console.error("Error sending OTP:", error);
        res.status(500).json({message:"Failed to send OTP", error: error.message});
    }
}

export const verifyOtp=async (req,res)=>{
    try{
        const {email,otp}=req.body;
        const user=await User.findOne({email});
        if(!user || user.resetOtp!==otp || user.otpExpires<Date.now()){
            return res.status(404).json({message:"invalid or expired OTP"});
        }
        user.isOtpVerified=true;
        user.resetOtp=undefined;
        user.otpExpires=undefined;
        await user.save();
        res.status(200).json({message:"OTP verified successfully"});
    }catch(error){
        res.status(500).json({message:"Failed to verify OTP"}); 
    }
}

export const resetPassword=async (req,res)=>{
    try{
        const {email,newPassword}=req.body;
        const user=await User.findOne({email});
        if(!user || !user.isOtpVerified){
            return res.status(404).json({message:"User not found or OTP not verified"});
        }
        
        user.password=newPassword;      //  this password will be hashed by pre-save hook in User model
        user.isOtpVerified=false;
        await user.save();
        res.status(200).json({message:"Password reset successfully"});
    }catch(error){
        res.status(500).json({message:"Failed to reset password"});
    }
}


export const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('sendSignupOtp invoked for:', email);

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Generate OTP
    const otp = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    // Store temporarily
    signupOtpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    });

    // Send mail
    await sendOtpMail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Error sending signup OTP:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};



export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedData = signupOtpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (storedData.expires < Date.now()) {
      signupOtpStore.delete(email);

      return res.status(400).json({
        message: "OTP expired",
      });
    }

   signupOtpStore.delete(email);

// Mark email as verified
verifiedSignupEmails.add(email);

res.status(200).json({
  message: "OTP verified successfully",
});

  } catch (error) {
    res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
};
