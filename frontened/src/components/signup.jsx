import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {useNavigate} from "react-router-dom";
import { useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from"zod";

import api from "../../lib/axios";


import { startLoading,registerFailure,registerSuccess } from "../redux/authSlice";   

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";


const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  role: z.enum(["Driver", "Customer"]),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      dispatch(startLoading());

      const response = await api.post("/auth/register", data);

      dispatch(registerSuccess(response.data));

      const role = response.data.role;

      if (role === "Driver") navigate("/driver/dashboard");
      if (role === "Customer") navigate("/customer/dashboard");
    } catch (err) {
      dispatch(
        registerFailure(
          err.response?.data?.message || "Registration failed"
        )
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Create Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label>Phone</Label>
              <Input {...register("phone")} />
              {errors.phone && (
                <p className="text-red-500 text-sm">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label>Role</Label>
              <Select onValueChange={(value) => setValue("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Driver">Driver</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm">
                  {errors.role.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;