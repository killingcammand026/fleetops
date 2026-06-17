import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { Button } from "../../components/ui/button";
import Register from "./Register";
import api from "../../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

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


      <Card className="relative z-10 w-[430px] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-2 transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center gap-4 mb-4">
                <IoArrowBack
  size={30}
  className="text-[#1d11cb] cursor-pointer"
  onClick={() => navigate("/register")}
/>
</div>
        <CardHeader>
                  <CardTitle className="text-center text-3xl font-bold text-white tracking-wide">
                    Forgot Password
                  </CardTitle>
                
                </CardHeader>

              
                    <CardContent>
            {step==1 &&
            <div>
                <div className="mb-6">
                    <Label className="text-gray-200">Email</Label>
                        <Input
                                    type="email"
                                    
                                    className="mt-2 bg-white/25 border-white/40 text-white 
                                    placeholder:text-white placeholder:opacity-80
                                    focus:bg-white/35 focus:ring-2 focus:ring-cyan-400 
                                    focus:shadow-[0_0_20px_rgba(34,211,238,0.4)]
                                    transition-all duration-300"
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
                   <Label className="text-gray-200">OTP</Label>
                        <Input
                                    type="text"
                                    
                                    className="mt-2 bg-white/25 border-white/40 text-white 
                                    placeholder:text-white placeholder:opacity-80
                                    focus:bg-white/35 focus:ring-2 focus:ring-cyan-400 
                                    focus:shadow-[0_0_20px_rgba(34,211,238,0.4)]
                                    transition-all duration-300"
                        placeholder="Enter your OTP"
                        onChange={(e)=>setOtp(e.target.value)} value={otp}
                    />
                    
                    <button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300 mt-4" onClick={handleVerifyOtp}> Verify OTP</button>
               </div>
            </div>
                    
                    }



                     {step==3 &&
            <div>
                <div className="mb-6">
                   <Label className="text-gray-200">New Password</Label>
                        <Input
                                    type="password"
                                    
                                    className="mt-2 bg-white/25 border-white/40 text-white 
                                    placeholder:text-white placeholder:opacity-80
                                    focus:bg-white/35 focus:ring-2 focus:ring-cyan-400 
                                    focus:shadow-[0_0_20px_rgba(34,211,238,0.4)]
                                    transition-all duration-300"
                        placeholder="Enter New Password"
                        onChange={(e)=>setNewPassword(e.target.value)} value={newPassword}
                    />
                    </div>
                     <div className="mb-6">
                     <Label className="text-gray-200">Confirm Password</Label>
                        <Input
                                    type="password"
                                    
                                    className="mt-2 bg-white/25 border-white/40 text-white 
                                    placeholder:text-white placeholder:opacity-80
                                    focus:bg-white/35 focus:ring-2 focus:ring-cyan-400 
                                    focus:shadow-[0_0_20px_rgba(34,211,238,0.4)]
                                    transition-all duration-300"
                        placeholder="Enter Confirm Password"
                        onChange={(e)=>setConfirmPassword(e.target.value)} value={confirmPassword}
                    />
                    </div>
                    <button className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300 mt-4" onClick={handleResetPassword}> Reset Password</button>
            </div>
                    
                    }



</CardContent>
              </Card>


        </div>


     
    )
}

export default ForgotPassword;