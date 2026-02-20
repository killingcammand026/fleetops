import { Worker } from "bullmq";

import Order from "../models/Order.model.js";
import Driver from "../models/Driver.model.js";
import { assignDriverService } from "../services/Order.service.js";
import { redisConnection } from "../config/redis.config.js";

console.log("Worker Started");

new Worker(
  "orderQueue",
  async (job) => {
    try {

      if (job.name !== "order-timeout") return;

      console.log("processing timeout job:", job.data);

      const { orderId, previousDriverId } = job.data;

      console.log("orderID and previousDriverID:", orderId, previousDriverId);

      const freshOrder = await Order.findById(orderId);

      if (!freshOrder) {
        console.log("Order not found");
        return;
      }

      console.log("Order status:", freshOrder.status);

      if (previousDriverId) {

        console.log("Pushing rejected driver:", previousDriverId);

        // make driver available again
        const driver = await Driver.findById(previousDriverId);

        if (driver) {
          driver.isAvailable = true;
          await driver.save();
        }

        // ✅ FIX: use string comparison for ObjectId
        const alreadyRejected = freshOrder.rejectedDrivers.some(
          id => id.toString() === previousDriverId.toString()
        );

        if (!alreadyRejected) {

          console.log("Before push:", freshOrder.rejectedDrivers);

          freshOrder.rejectedDrivers.push(previousDriverId);

          console.log("After push:", freshOrder.rejectedDrivers);

        }

      }

      // reset order
      freshOrder.driver = null;
      freshOrder.status = "CREATED";

      await freshOrder.save();

      console.log("Rejected drivers after save:", freshOrder.rejectedDrivers);

      // assign next driver
      await assignDriverService(orderId);

    } catch (error) {

      console.error("Worker error:", error);

    }
  },
  {
    connection: redisConnection,
    concurrency: 1   // ✅ prevent race condition
     }
);
