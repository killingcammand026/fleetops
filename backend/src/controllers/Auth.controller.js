import {
    registerService,
    loginService
} from '../services/Auth.service.js';

import admin from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Customer from "../models/Customer.model.js";

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



export const registerController=async(req,res)=>{
    const {name,email,password}=req.body;
    try{
        const user=await registerService(name,email,password);
        res.status(201).json(user);
    }
    catch(error){
        res.status(400).json({error:error.message});
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