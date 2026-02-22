// Order Creation Form for Customers (payment methods aligned with backend; Razorpay for non-COD)

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createOrderAPI } from "../../services/orderService";
import { createCustomerAPI } from "../../services/customerService";
import { createPaymentOrderAPI, verifyPaymentOrderAPI } from "../../services/paymentService";
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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => resolve(); // still resolve so we can show error
    document.body.appendChild(script);
  });
};

const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...options,
      handler: (res) => resolve(res),
      modal: { ondismiss: () => reject(new Error("Payment closed")) },
    });
    rzp.open();
  });
};

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
  const { user } = useSelector((state) => state.auth);

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
      let newOrder = await createOrderAPI(data);
      const orderId = newOrder._id;
      const paymentMethod = (data.paymentMethod || "").trim();

      dispatch(addOrder(newOrder));

      if (paymentMethod === "COD") {
        toast.success("Order placed successfully! (Cash on Delivery)");
        reset();
        setLoading(false);
        return;
      }

      // Non-COD: create Razorpay order and open checkout
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!keyId) {
        toast.error("Payment setup missing. Set VITE_RAZORPAY_KEY_ID in .env.");
        setLoading(false);
        return;
      }

      const { razorpayOrder } = await createPaymentOrderAPI(orderId);
      if (!razorpayOrder || !razorpayOrder.id) {
        toast.error("Could not create payment session.");
        setLoading(false);
        return;
      }

      await loadRazorpayScript();
      const payment = await openRazorpayCheckout({
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        order_id: razorpayOrder.id,
        name: "FleetOps",
        description: "Order payment",
      }).catch(() => null);

      if (!payment) {
        toast.info("Payment cancelled or closed.");
        setLoading(false);
        return;
      }

      await verifyPaymentOrderAPI(orderId, {
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      });
      toast.success("Order placed and payment completed successfully!");
      reset();
    } catch (err) {
      console.error("Create Order Error:", err.response?.data || err);
      const backendError = err.response?.data?.error || err.response?.data?.message;

      // If customer profile is missing, create it once and retry order creation.
      if (backendError === "Customer profile Not found" && user) {
        try {
          await createCustomerAPI({
            userId: user.id || user._id,
            name: user.name || "Customer",
          });
          const retryOrder = await createOrderAPI(data);
          const orderId = retryOrder._id;
          const paymentMethod = (data.paymentMethod || "").trim();

          dispatch(addOrder(retryOrder));

          if (paymentMethod === "COD") {
            toast.success("Order placed successfully! (Cash on Delivery)");
            reset();
            setLoading(false);
            return;
          }

          const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
          if (!keyId) {
            toast.error("Payment setup missing. Set VITE_RAZORPAY_KEY_ID in .env.");
            setLoading(false);
            return;
          }

          const { razorpayOrder } = await createPaymentOrderAPI(orderId);
          if (!razorpayOrder || !razorpayOrder.id) {
            toast.error("Could not create payment session.");
            setLoading(false);
            return;
          }

          await loadRazorpayScript();
          const payment = await openRazorpayCheckout({
            key: keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency || "INR",
            order_id: razorpayOrder.id,
            name: "FleetOps",
            description: "Order payment",
          }).catch(() => null);

          if (!payment) {
            toast.info("Payment cancelled or closed.");
            setLoading(false);
            return;
          }

          await verifyPaymentOrderAPI(orderId, {
            razorpayOrderId: payment.razorpay_order_id,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature,
          });
          toast.success("Order placed and payment completed successfully!");
          reset();
          return;
        } catch (innerErr) {
          console.error("Auto-create customer or retry order failed:", innerErr.response?.data || innerErr);
          toast.error(
            innerErr.response?.data?.error ||
              innerErr.response?.data?.message ||
              innerErr.message ||
              "Failed to create order."
          );
        }
      } else {
        toast.error(
          backendError || err.message || "Failed to create order."
        );
      }
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
                {/* Match backend Order.model payment.method enum */}
                <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Wallet">Wallet</SelectItem>
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