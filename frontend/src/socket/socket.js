import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
 
  if (socket) return socket;

  socket = io("http://localhost:3000", {
    withCredentials: true,
    transports: ["websocket"],
    autoConnect: true,
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