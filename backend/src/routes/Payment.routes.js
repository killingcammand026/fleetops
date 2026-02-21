import express from "express";
import { createPaymentController,verifyPaymentController,handleRazorpayWebhookController } from "../controllers/Payment.controller.js";
import { protect,authorizeRoles } from "../middlewares/Auth.middleware.js";

const router=express.Router();

router.post("/:id/createPaymentOrder",protect,authorizeRoles(["Customer"]),createPaymentController);
router.post("/:id/verifyPaymentOrder",protect,authorizeRoles(["Customer"]),verifyPaymentController);
router.post("/webhook",handleRazorpayWebhookController);

export default router;