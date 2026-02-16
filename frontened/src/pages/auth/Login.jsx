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

     const role = response.data.role || JSON.parse(
            atob(response.data.token.split(".")[1])
        ).role;

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[420px] shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Login to Fleet Manager
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}

            {/* Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
 




