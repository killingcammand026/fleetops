import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
    


import api from "../../lib/axios";
import {
  startLoading,
  loginSuccess,
  loginFailure,
} from "../../redux/slices/authSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const schema = z.object({
  email: z.string().email("Enter valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});



const Login=()=>{
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {loading,error}=useSelector((state)=>state.auth);
   

    const {register,
        handleSubmit,
        formState:{errors},
    }=useForm({
        resolver:zodResolver(schema),
    });    


    const onSubmit=async(data)=>{
        try{
            dispatch(startLoading());   
            const response=await api.post("/auth/login",data);
  
             dispatch(loginSuccess(response.data));

     const role = response.data.user.role;


        if (role === "Admin") navigate("/admin/dashboard");
        if (role === "Driver") navigate("/driver/dashboard");
        if (role === "Customer") navigate("/customer/dashboard");

    } catch (err) {
        const message = err.response?.data?.message
          ? err.response.data.message
          : err.code === "ERR_NETWORK" || !err.response
            ? "You are not resgistered yet, Please register first"
            : "Login failed";
        dispatch(loginFailure(message));
    }
  };


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

      {/* Login Card */}
      <Card className="relative z-10 w-[430px] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-2 transition-all duration-500 hover:scale-[1.02]">
        
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-white tracking-wide">
            Fleet Manager
          </CardTitle>
          <p className="text-center text-sm text-gray-300 mt-1">
            Secure Login Portal
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email */}
            <div>
              <Label className="text-gray-200">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mt-2 bg-white/25 border-white/40 text-white 
                placeholder:text-white placeholder:opacity-80
                focus:bg-white/35 focus:ring-2 focus:ring-cyan-400 
                focus:shadow-[0_0_20px_rgba(34,211,238,0.4)]
                transition-all duration-300"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label className="text-gray-200">Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="mt-2 bg-white/25 border-white/40 text-white 
                placeholder:text-white placeholder:opacity-80
                focus:bg-white/35 focus:ring-2 focus:ring-indigo-400 
                focus:shadow-[0_0_20px_rgba(99,102,241,0.4)]
                transition-all duration-300"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-300 text-center text-sm bg-red-500/20 p-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-semibold py-2 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Register */}
            <p className="text-center text-sm text-gray-300 mt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-cyan-300 font-semibold hover:text-white hover:underline transition"
              >
                Sign Up
              </Link>
            </p>

          </form>
        </CardContent>
      </Card>

      {/* Custom Gradient Animation */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 300% 300%;
            animation: gradientMove 12s ease infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
