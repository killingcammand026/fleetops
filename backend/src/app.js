import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import orderRoutes from './routes/Order.routes.js'
import userRoutes from './routes/User.routes.js'
import driverRoutes from './routes/Driver.routes.js'
import customerRoutes from './routes/Customer.routes.js'
import authRoutes from './routes/Auth.routes.js'
import http from "http"
import { Server } from 'socket.io'
import initializeSocket from "./sockets/index.socket.js"
import "./workers/Order.worker.js"
dotenv.config()

const app = express()
const server=http.createServer(app);
const port = 3000


//middleware to parse JSON requests
app.use(express.json());


initializeSocket(server);

// Importing and using Order routes
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('FleetOps Backend Running 🚀')
})

// app.listen(port, async () => {
//   await connectDB();
//   console.log(`Example app listening on port ${port}`)
// })
server.listen(3000,async()=>{
  await connectDB();
  console.log("Server Running on port 5000");
});

export default app;

