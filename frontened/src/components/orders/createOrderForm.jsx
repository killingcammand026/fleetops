// Order Creation Form for Customers

import { useState } from "react";
import { useDispatch } from "react-redux";
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

const orderSchema = z.object({
  pickupLatitude: z.coerce.number(),
  pickupLongitude: z.coerce.number(),
  dropLatitude: z.coerce.number(),
  dropLongitude: z.coerce.number(),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

const CreateOrderForm = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(orderSchema), // ✅ FIXED HERE
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const newOrder = await createOrderAPI(data); // ✅ already correct structure

      dispatch(addOrder(newOrder));
      toast.success("Order placed successfully!");
      reset();

    } catch (err) {
      console.error("Create Order Error:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Failed to create order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <Label>Pickup Latitude</Label>
            <Input
              type="number"
              step="any"
              {...register("pickupLatitude")}
              placeholder="e.g. 28.6139"
            />
            {errors.pickupLatitude && (
              <p className="text-red-500 text-sm">
                {errors.pickupLatitude.message}
              </p>
            )}
          </div>

          <div>
            <Label>Pickup Longitude</Label>
            <Input
              type="number"
              step="any"
              {...register("pickupLongitude")}
              placeholder="e.g. 77.2090"
            />
            {errors.pickupLongitude && (
              <p className="text-red-500 text-sm">
                {errors.pickupLongitude.message}
              </p>
            )}
          </div>

          <div>
            <Label>Drop Latitude</Label>
            <Input
              type="number"
              step="any"
              {...register("dropLatitude")}
              placeholder="e.g. 28.7041"
            />
            {errors.dropLatitude && (
              <p className="text-red-500 text-sm">
                {errors.dropLatitude.message}
              </p>
            )}
          </div>

          <div>
            <Label>Drop Longitude</Label>
            <Input
              type="number"
              step="any"
              {...register("dropLongitude")}
              placeholder="e.g. 77.1025"
            />
            {errors.dropLongitude && (
              <p className="text-red-500 text-sm">
                {errors.dropLongitude.message}
              </p>
            )}
          </div>

          <div>
            <Label>Payment Method</Label>
            <Select
              onValueChange={(value) =>
                setValue("paymentMethod", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {/* ✅ Match backend values exactly */}
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateOrderForm;