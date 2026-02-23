import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import api from "../../lib/axios";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../../lib/firebase";

import {
  startLoading,
  registerFailure,
  registerSuccess,
} from "../../redux/slices/authSlice";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";


// ✅ Updated schema (removed phone & role)
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      dispatch(startLoading());

      const response = await api.post("/auth/register", data);
      dispatch(registerSuccess(response.data));

      const role = response.data.role || response.data.user?.role;
      if (role === "Admin") navigate("/admin/users");
      else if (role === "Driver") navigate("/driver/dashboard");
      else if (role === "Fleet Manager" || role === "FleetManager") navigate("/fleet/users");
      else if (role === "Customer") navigate("/customer/dashboard");
      else navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK" || err.message === "Network Error"
          ? "Registration failed"
          : err.message) ||
        "Registration failed";
      dispatch(registerFailure(message));
    }
  };

  const handleGoogleAuth = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    console.log("User:", result.user);

    const token = await result.user.getIdToken();

    // OPTIONAL: send to backend
    // const response = await api.post("/auth/google", { token });

    navigate("/"); // redirect after success
  } catch (error) {
    console.error("Google Sign-in Error:", error);
  }
};

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-950">

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-800 to-cyan-600 animate-gradient opacity-90"></div>

      {/* Glow Orbs */}
      <div className="absolute w-72 h-72 bg-cyan-400/30 rounded-full blur-3xl animate-pulse top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse bottom-10 right-10"></div>
      <div className="absolute w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-1/2 left-1/3"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:40px_40px]"></div>

      {/* Register Card */}
      <Card className="relative z-10 w-[480px] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02]">

        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-white tracking-wide">
            Create Account
          </CardTitle>
          <p className="text-center text-sm text-gray-300 mt-1">
            Join Fleet Manager Platform
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Name */}
            <div>
              <Label className="text-gray-200">Name</Label>
              <Input
                placeholder="Enter your name"
                className="mt-2 bg-white/25 border-white/40 text-white 
                placeholder:text-white placeholder:opacity-80
                focus:bg-white/35 focus:ring-2 focus:ring-cyan-400 
                transition-all duration-300"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-300 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label className="text-gray-200">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mt-2 bg-white/25 border-white/40 text-white 
                placeholder:text-white placeholder:opacity-80
                focus:bg-white/35 focus:ring-2 focus:ring-indigo-400 
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
                placeholder="Create a password"
                className="mt-2 bg-white/25 border-white/40 text-white 
                placeholder:text-white placeholder:opacity-80
                focus:bg-white/35 focus:ring-2 focus:ring-purple-400 
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
              className="w-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300"
            >
              {loading ? "Creating..." : "Sign Up"}
            </Button>


            <Button 
            type="button"
            className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300" onClick={handleGoogleAuth}>
             <FcGoogle className="inline mr-2" size={20} />
             <span> Sign Up with Google </span>
            </Button>

          </form>
        </CardContent>
      </Card>

      {/* Gradient Animation */}
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

export default Register;