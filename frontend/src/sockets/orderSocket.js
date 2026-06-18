import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: false,  // don't connect until we have a token
  auth: {
    token: localStorage.getItem("token")
  }
});

export const connectSocket = () => {
  socket.auth = { token: localStorage.getItem("token") };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;