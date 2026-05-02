import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  // If socket already exists and is connected, don't create a new one
  if (socket?.connected) return socket;

  socket = io("http://localhost:3000", {
    withCredentials: true,
    transports: ["websocket"], // Forces websocket for better performance
  });

  socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
  socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};