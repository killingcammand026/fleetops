import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { Button } from "../../components/ui/button";
import Register from "./Register";
import api from "../../lib/axios";

const ForgotPassword = () => {
    const [step,setStep]=useState(1);
    const [email,setEmail]=useState("");
    const [otp,setOtp]=useState("");
    const [newPassword,setNewPassword]=useState("");
    const [confirmPassword,setConfirmPassword]=useState("");
    const navigate=useNavigate();


    const handleSendOtp=async ()=>{   
        try{
            const result=await api.post("/auth/send-otp",{email},{withCredentials:true});
           setStep(2);
        }catch(err){
            console.error("Failed to send OTP:",err);
        }
    }

    const handleVerifyOtp=async ()=>{   
        try{
           const result=await api.post("/auth/verify-otp",{email,otp},{withCredentials:true});
           setStep(3);
        }catch(err){
            console.error("Failed to send OTP:",err);
        }
    }

    const handleResetPassword=async ()=>{  
        if(newPassword!==confirmPassword){
            alert("Passwords do not match");
            return;
        } 
        try{
            const  result=await api.post("/auth/reset-password",{email,newPassword},{withCredentials:true});
           navigate("/login");
        }catch(err){
            console.error("Failed to send OTP:",err);
        }
    }



    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-950">

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-800 to-cyan-600 animate-gradient opacity-90"></div>

      {/* Floating Glow Orbs */}
      <div className="absolute w-72 h-72 bg-cyan-400/30 rounded-full blur-3xl animate-pulse top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse bottom-10 right-10"></div>
      <div className="absolute w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-1/2 left-1/3"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:40px_40px]"></div>


      <div className="relative z-10 bg-white rounded-xl shadow-lg w-full max-w-md p-8">
            <div className="flex items-center gap-4 mb-4">
                <IoArrowBack
  size={30}
  className="text-[#1d11cb] cursor-pointer"
  onClick={() => navigate("/register")}
/>
                <h1 className="text-2xl font-bold text-center text-[#1d11cb] ">Forgot Password</h1>
            </div>
            {step==1 &&
            <div>
                <div className="mb-6">
                    <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none "
                        placeholder="Enter your email"
                        onChange={(e)=>setEmail(e.target.value)} value={email}
                    />
                   
                    <button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300 mt-4" onClick={handleSendOtp}> Send OTP</button>
               </div>
            </div>
                }



                {step==2 &&
            <div>
                <div className="mb-6">
                    <label htmlFor="text" className="block mb-1 font-medium text-gray-700">OTP</label>
                    <input
                        type="text"
                        id="text"
                        className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none "
                        placeholder="Enter OTP"
                        onChange={(e)=>setOtp(e.target.value)} value={otp}
                    />
                    
                    <button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300 mt-4" onClick={handleVerifyOtp}> Verify OTP</button>
               </div>
            </div>
                    
                    }



                     {step==3 &&
            <div>
                <div className="mb-6">
                    <label htmlFor="password" className="block mb-1 font-medium text-gray-700">New Password</label>
                    <input
                        type="password"
                        id="password"
                        className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none "
                        placeholder="Enter new password"
                        onChange={(e)=>setNewPassword(e.target.value)} value={newPassword}
                    />
                    </div>
                     <div className="mb-6">
                     <label htmlFor="password" className="block mb-1 font-medium text-gray-700">Confirm Password</label>
                    <input
                        type="password"
                        id="password"
                        className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none "
                        placeholder="Enter Confirm Password"
                        onChange={(e)=>setConfirmPassword(e.target.value)} value={confirmPassword}
                    />
                    </div>
                    <button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300 mt-4" onClick={handleResetPassword}> Reset Password</button>
            </div>
                    
                    }



        </div>


       </div>
    )
}

export default ForgotPassword;