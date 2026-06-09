import { io } from "socket.io-client";
import {store } from '../store/store'
import { setOnlineStatus } from "../store/auth-slice";

let socket = null;

export const connectSocket = () => {
  if (socket) return socket;
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  socket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    store.dispatch(setOnlineStatus(true)); // ✅ set own user online instantly
  });
 socket.on("disconnect", () => {
    store.dispatch(setOnlineStatus(false)); // ✅ set own user offline
  });
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
