import http from "http";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import initializeSocket from "./sockets/index.socket.js";


const server = http.createServer(app);

const startServer = async () => {
  try {

    // 1. Connect Database FIRST
    await connectDB();
    console.log("MongoDB Connected");

    // 2. Initialize Socket
    initializeSocket(server);
    console.log("Socket initialized");

    // 3. Start Server
    server.listen(process.env.PORT, () => {
      console.log(`Server Running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
