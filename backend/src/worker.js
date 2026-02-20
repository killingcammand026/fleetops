import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const startWorker = async () => {
  try {

    await connectDB();

    console.log("Worker MongoDB Connected");

    // start worker AFTER DB connection
    await import("./workers/Order.worker.js");

  } catch (error) {
    console.error("Worker startup error:", error);
  }
};

startWorker();
