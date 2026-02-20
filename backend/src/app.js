import express from "express";
import cors from "cors"
import orderRoutes from "./routes/Order.routes.js";
import userRoutes from "./routes/User.routes.js";
import driverRoutes from "./routes/Driver.routes.js";
import customerRoutes from "./routes/Customer.routes.js";
import authRoutes from "./routes/Auth.routes.js";


// import "./workers/Order.worker.js";

const app = express();
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes);



app.get("/", (req, res) => {
  res.send("FleetOps Backend Running 🚀");
});

export default app;
