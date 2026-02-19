import { Worker } from "bullmq";
import { RedisConnection } from "bullmq";
import Order from "../models/Order.model.js"
import Driver from "../models/Driver.model.js"
import {assignDriverService} from "../services/Order.service.js"
import { redisConnection } from "../config/redis.config.js";

console.log("Worker Started");

new Worker(
    "orderQueue",
    async job =>{
        if(job.name==="order-timeout"){
            console.log("processing timeout job:",job.data);

            const {orderId,previousDriverId}=job.data;

            const freshOrder=await Order.findById(orderId);
            if(!freshOrder) return;

            console.log("Order status:", freshOrder.status);

            if (freshOrder.status === "DRIVER_ASSIGNED") {
                 console.log("Pushing rejected driver:", previousDriverId);
                 if (previousDriverId) {

                   const driver = await Driver.findById(previousDriverId);
                        if (driver) {
                          driver.isAvailable = true;
                        await driver.save();
                       }

        // 🔥 THIS LINE IS CRITICAL
        console.log("Before push:", freshOrder.rejectedDrivers);
        freshOrder.rejectedDrivers.push(previousDriverId);
        console.log("After push:", freshOrder.rejectedDrivers);
        await freshOrder.save();
    }

    freshOrder.driver = null;
    freshOrder.status = "CREATED";

    await freshOrder.save();
    console.log("Rejected drivers after push:", freshOrder.rejectedDrivers);
    await assignDriverService(orderId);
}

        }
    },
    {
        connection:redisConnection
    }
);
