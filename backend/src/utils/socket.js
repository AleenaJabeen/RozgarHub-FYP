import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Must match your frontend URL
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);
    
    socket.on("join_personal_room", (userId) => {
      if (!userId) {
        console.log(`⚠️ [Socket] Client ${socket.id} tried to join, but userId is missing!`);
        return; 
      }
      const roomName = `provider_${userId}`;
      socket.join(roomName);
      console.log(`📍 [Socket] Provider ${socket.id} joined personal location room: ${roomName}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

// We will import this function into your order controller to send the broadcast!
export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};