import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import cookie from "cookie";
import { sendPushNotification } from "../services/notification.service.js";
import { User } from "../models/user.model.js";

let io;
const onlineUsers = new Map();
const disconnectTimers = new Map();

/**
 * Call this once in server.js, passing the raw http.Server instance.
 * After that, anywhere in your app you can call getIO() to emit events.
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const rawCookies = socket.handshake.headers.cookie;
      if (!rawCookies) {
        return next(new Error("No cookies"));
      }

      const parsed = cookie.parse(rawCookies);

      const token = parsed.accessToken; // 👈 use your actual cookie name

      if (!token) {
        return next(new Error("No access token"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      socket.user = decoded;

      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });
  // ─── Connection ────────────────────────────────────────────────────────────
  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    // temp seting up online
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
    });

    io.emit("user_online", userId);
    // Each user joins their own personal room so we can reach them by userId
    socket.join(userId);

    // ── join_chat ────────────────────────────────────────────────────────────
    // Client emits this right after opening a chat window.
    // Payload: { chatId }
    // Server joins the socket to the chat room so it receives real-time messages.
    socket.on("join_chat", async ({ chatId }) => {
      try {
        console.log("JOIN REQUEST:", chatId, "USER:", userId);

        // Verify the user is actually a participant
        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId,
        });
        if (!chat) return socket.emit("error", { message: "Chat not found" });

        console.log("✅ JOINED ROOM:", chatId);
        socket.join(chatId);
        console.log(`User ${userId} joined chat room ${chatId}`);
        console.log("JOIN EVENT DATA:", chatId);
        await Message.updateMany(
          {
            chatId,
            senderId: { $ne: userId },
            status: "sent",
          },
          {
            status: "delivered",
          },
        );
      } catch (err) {
        console.error("join_chat error:", err);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // ── leave_chat ───────────────────────────────────────────────────────────
    // Client emits when closing a chat window.
    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(chatId);
    });

    // ── send_message ─────────────────────────────────────────────────────────
    // Payload: { chatId, type, content?, mediaUrl? }
    // Server saves the message, updates the chat, then broadcasts to the room.
    socket.on("send_message", async (payload) => {
      try {
        const { chatId, type, content, mediaUrl } = payload;

        if (!chatId || !type) {
          return socket.emit("error", {
            message: "chatId and type are required",
          });
        }
        if (type === "text" && !content?.trim()) {
          return socket.emit("error", {
            message: "Text message cannot be empty",
          });
        }
        if (type !== "text") {
          return socket.emit("error", {
            message: "Only text messages allowed via Socket.IO",
          });
        }

        // Verify participant
        const chat = await Chat.findOne({ _id: chatId, participants: userId });
        if (!chat) return socket.emit("error", { message: "Chat not found" });
        

        // Persist
        const message = await Message.create({
          chatId,
          senderId: userId,
          type,
          content: content?.trim(),
          mediaUrl,
          status: "sent",
        });

        // Update chat's lastMessage pointer
        const receiverId = chat.participants
          .map((id) => id.toString())
          .find((id) => id !== userId);


        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
          $inc: {
            [`unreadCounts.${receiverId}`]: 1,
          },
        });

        // Populate sender for the emitted payload
        await message.populate("senderId", "name avatar");
        const roomMembers = io.sockets.adapter.rooms.get(chatId);
        console.log("ROOM MEMBERS:", roomMembers);
        // Broadcast to everyone in the room (including sender — client can use
        // this as the "delivered" confirmation and replace the optimistic copy)
        io.to(chatId).emit("new_message", message);

        // Also notify the OTHER participant's personal room if they're not in
        // this chat window right now (for unread badge / push notification hook)
        const otherId = chat.participants
          .map((p) => p.toString())
          .find((id) => id !== userId);

        if (otherId) {
          io.to(otherId).emit("chat_updated", {
            chatId,
            lastMessage: message,
            lastMessageAt: message.createdAt,
          });
          const receiverSockets = onlineUsers.get(otherId);
          console.log("Receiver Sockets:", receiverSockets);

          const isReceiverOnline = receiverSockets?.size > 0;

          if (!isReceiverOnline) {
            await sendPushNotification({
              userId: otherId,
              title: message.senderId.name,
              body: message.content || "Sent you a message",
              data: {
                type: "message",
                chatId: chatId.toString(),
              },
            });
          }
        }

        // Acknowledge the sender
        socket.emit("message_sent", { tempId: payload.tempId, message });
      } catch (err) {
        console.error("send_message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── message_delivered ────────────────────────────────────────────────────
    // Client emits when it renders a message it received (while chat is open).
    // Payload: { messageId, chatId }
    socket.on("message_delivered", async ({ messageId, chatId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { status: "delivered" },
          { new: true },
        );
        if (!message) return;

        // Tell the sender the message was delivered
        io.to(message.senderId.toString()).emit("message_status_updated", {
          messageId,
          status: "delivered",
          chatId,
        });
      } catch (err) {
        console.error("message_delivered error:", err);
      }
    });

    // ── message_read ─────────────────────────────────────────────────────────
    // Client emits when the user actually reads the message.
    // Payload: { messageId, chatId }
    socket.on("message_read", async ({ messageId, chatId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { status: "read" },
          { new: true },
        );
        if (!message) return;

        io.to(message.senderId.toString()).emit("message_status_updated", {
          messageId,
          status: "read",
          chatId,
        });
      } catch (err) {
        console.error("message_read error:", err);
      }
    });

    socket.on("edit_message", async ({ messageId, content }) => {
      try {
        const message = await Message.findById(messageId);

        if (!message) return;
        if (message.senderId.toString() !== userId) return;
        if (message.type !== "text") return;

        message.content = content.trim();
        message.isEdited = true;
        await message.save();

        await message.populate("senderId", "name avatar");

        io.to(message.chatId.toString()).emit("message_edited", message);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("delete_message", async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);

        if (!message) return;
        if (message.senderId.toString() !== userId) return;

        message.deletedForEveryone = true;
        message.content = "";
        message.mediaUrl = "";
        await message.save();

        io.to(message.chatId.toString()).emit("message_deleted", {
          messageId,
          chatId: message.chatId,
          deletedForEveryone: true,
        });
      } catch (error) {
        console.error(error);
      }
    });

    // ── typing ───────────────────────────────────────────────────────────────
    // Payload: { chatId, isTyping }
    socket.on("typing", ({ chatId, isTyping }) => {
      // Broadcast to everyone EXCEPT the sender
      socket.to(chatId).emit("user_typing", {
        userId,
        chatId,
        isTyping,
      });
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId);
      sockets?.delete(socket.id);

      if (!sockets || sockets.size === 0) {
        onlineUsers.delete(userId);

        const timer = setTimeout(async () => {
          // Only mark offline if they haven't reconnected
          if (!onlineUsers.has(userId)) {
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastActiveAt: new Date(),
            });
            // ✅ emit to everyone EXCEPT the disconnected user
            socket.broadcast.emit("user_offline", userId);
          }
        }, 8000); // 8s grace period for slow connections

        disconnectTimers.set(userId, timer);
      }
    });
  });

  return io;
};

/**
 * Use this anywhere in your app (e.g. in controllers triggered by HTTP requests)
 * to emit Socket.io events without importing the io instance directly.
 *
 * Example:
 *   const io = getIO();
 *   io.to(userId).emit("order_update", data);
 */
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialised. Call initSocket first.");
  return io;
};
