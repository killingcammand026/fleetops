import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { FcGoogle } from "react-icons/fc";
import { signInWithPopup , GoogleAuthProvider} from "firebase/auth";
import { auth } from "../../lib/firebase"; 

    


import api from "../../lib/axios";
import {
  startLoading,
  loginSuccess,
  loginFailure,
  resetLoginForm,
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

    // Reset form state on mount so button shows "Login" and is clickable (fixes persisted loading: true)
    React.useEffect(() => {
        dispatch(resetLoginForm());
    }, [dispatch]);

    const {register,
        handleSubmit,
        formState:{errors},
    }=useForm({
        resolver:zodResolver(schema),
    });    


    const onSubmit = async (data) => {
      try {
        dispatch(startLoading());

        const response = await api.post("/auth/login", data);
        dispatch(loginSuccess(response.data));

        const role = response.data.user?.role || response.data.role;

        if (role === "Admin") navigate("/admin/users");
        if (role === "Driver") navigate("/driver/dashboard");
        if (role === "Fleet Manager") navigate("/fleet/users");
        if (role === "Customer") navigate("/customer/dashboard");
      } catch (err) {
        const message =
          err.response?.data?.message ||
          (err.code === "ERR_NETWORK" || err.message === "Network Error"
            ? "Login failed"
            : err.message) ||
          "Login failed";
        dispatch(loginFailure(message));
      }
    };

    const handleGoogleLogin = async () => {
  try {
    dispatch(startLoading());

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const token = await result.user.getIdToken();

    const response = await api.post("/auth/google", { token });

    dispatch(loginSuccess(response.data));

    const role = response.data.user?.role;

    if (role === "Admin") navigate("/admin/users");
    else if (role === "Driver") navigate("/driver/dashboard");
    else if (role === "Fleet Manager") navigate("/fleet/users");
    else navigate("/customer/dashboard");

  } catch (err) {
    console.error(err);
    dispatch(loginFailure(
      err.response?.data?.message || "Google login failed"
    ));
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

            <div className="text-right mb-4  text-[#ff6e6e] hover:underline cursor-pointer text-sm font-medium" onClick={()=>navigate("/forgot-password")}>
              Forgot password
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
              className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-semibold py-2 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

               <Button 
                        type="button"
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300" onClick={handleGoogleLogin}>
                         <FcGoogle className="inline mr-2" size={20} />
                         <span> Sign Up with Google </span>
                </Button>

          </form>

            {/* Register link outside form so it's always clickable and never triggers submit */}
            <p className="text-center text-sm text-gray-300 mt-4 pt-2 border-t border-white/10">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-cyan-300 font-semibold hover:text-white hover:underline transition cursor-pointer inline-block relative z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent rounded"
              >
                Sign Up
              </Link>
            </p>
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