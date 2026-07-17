import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import orderRoutes from "./routes/Order.routes.js";
import userRoutes from "./routes/User.routes.js";
import driverRoutes from "./routes/Driver.routes.js";
import customerRoutes from "./routes/Customer.routes.js";
import authRoutes from "./routes/Auth.routes.js";
import paymentRoutes from "./routes/Payment.routes.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* CORS */

app.use(cors({
  origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
          
  credentials: true
}));
// simple request logger to help debug 404s from frontend
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});
app.use("/api/payment/webhook",
    express.raw({type:"application/json"})
);
app.use(express.json());

/* API routes */

app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

/* React build */


/* React build */

const frontendPath = path.join(__dirname, "../dist");

app.use(express.static(frontendPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;