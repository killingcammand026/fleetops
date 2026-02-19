// Order Creation Form for Customers
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createOrderAPI } from "../../services/orderService";
import { addOrder } from "../../redux/slices/orderSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

const schema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  priority: z.enum(["low", "normal", "high"]),
});

const CreateOrderForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: user?.name || "",
      priority: "normal",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);
    try {
      const orderData = {
        ...data,
        customerId: user?._id || user?.id,
        fleetManagerId: null, // Will be assigned by fleet manager
      };

      const newOrder = await createOrderAPI(orderData);
      dispatch(addOrder(newOrder));
      setSuccess(true);
      reset();
      toast.success("Order placed! Fleet manager will assign a driver shortly.", {
        duration: 4000,
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to create order:", err);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200/80 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">+</span>
          Create New Order
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-start gap-2">
          <span className="text-indigo-600 mt-0.5">ℹ️</span>
          <p className="text-sm text-indigo-800">
            After placing your order, a <strong>fleet manager</strong> will assign
            a driver. You&apos;ll see driver details in your pending orders once
            assigned.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Your Name</Label>
            <Input
              {...register("customerName")}
              placeholder="Enter your name"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div>
            <Label>Pickup Address</Label>
            <Input
              {...register("pickupAddress")}
              placeholder="Enter pickup address"
            />
            {errors.pickupAddress && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pickupAddress.message}
              </p>
            )}
          </div>

          <div>
            <Label>Delivery Address</Label>
            <Input
              {...register("deliveryAddress")}
              placeholder="Enter delivery address"
            />
            {errors.deliveryAddress && (
              <p className="text-red-500 text-sm mt-1">
                {errors.deliveryAddress.message}
              </p>
            )}
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              onValueChange={(value) => setValue("priority", value)}
              defaultValue="normal"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">
                {errors.priority.message}
              </p>
            )}
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg">
                ✓
              </div>
              <div>
                <p className="font-medium text-emerald-900">Order placed!</p>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Driver will be assigned by fleet manager. Check pending orders
                  for updates.
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Placing order...
              </span>
            ) : (
              "Place Order"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateOrderForm;
