import { Message } from "../../models/message.model.js";
import { Chat } from "../../models/chat.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getIO } from "../../socket/socket.js";
import { sendPushNotification } from "../../services/notification.service.js";
import { createNotification } from "../notification/notification.controller.js";
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, type, content } = req.body;

  if (!chatId || !type) {
    throw new ApiError(400, "chatId and type required");
  }
  if (type === "text" && !content?.trim()) {
    throw new ApiError(400, "Text message cannot be empty");
  }
  if (!["image", "video", "audio"].includes(type)) {
    throw new ApiError(400, "Invalid message type");
  }

  if (type === "text") {
    throw new ApiError(400, "Text messages must be sent via Socket.IO");
  }

  let mediaUrl = "";

  // Handle file upload
  if (req.file) {
    const upload = await uploadOnCloudinary(req.file.path);

    if (!upload) {
      throw new ApiError(500, "File upload failed");
    }

    mediaUrl = upload.secure_url;
  }

  const chat = await Chat.findOne({
    _id: chatId,
    participants: req.user._id,
  });

  if (!chat) {
    throw new ApiError(403, "Unauthorized");
  }

  const message = await Message.create({
    chatId,
    senderId: req.user._id,
    type,
    content,
    mediaUrl,
  });

  const receiverId = chat.participants
    .map((id) => id.toString())
    .find((id) => id !== req.user._id.toString());

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
    $inc: {
      [`unreadCounts.${receiverId}`]: 1,
    },
  });

  const fullMessage = await Message.findById(message._id).populate(
    "senderId",
    "name email",
  );

  // 🔥 SOCKET EMIT
  const io = getIO();
  io.to(chatId).emit("new_message", fullMessage);

  console.log("Emitted new_message to chat room:", chatId);
  // Check if receiver is currently inside this chat room
  const roomMembers = io.sockets.adapter.rooms.get(chatId);

  const isReceiverInChatRoom = [...(roomMembers || [])].some((socketId) => {
    const socketInstance = io.sockets.sockets.get(socketId);

    return socketInstance?.user?._id?.toString() === receiverId;
  });

  console.log("Receiver in chat room:", isReceiverInChatRoom);

  // Send push notification only if receiver is NOT viewing chat
  if (!isReceiverInChatRoom) {
    let notificationBody = "Sent you a message";

    if (type === "image") {
      notificationBody = "Sent an image";
    }

    if (type === "video") {
      notificationBody = "Sent a video";
    }

    if (type === "audio") {
      notificationBody = "Sent an audio message";
    }

    await sendPushNotification({
      userId: receiverId,
      title: fullMessage.senderId.name,
      body: notificationBody,
      data: {
        type: "message",
        chatId: chatId.toString(),
        messageType: type,
      },
    });
    const notification = await createNotification({
      recipient: receiverId,
      sender: senderId,
      type: "message",
      title: "New Message",
      message: notificationBody,
      link: `/messages/${chatId}`,
    });
    io.to(receiverId.toString()).emit("new_notification", notification);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, fullMessage, "Message sent"));
});

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 30);

  // Verify the requester is a participant
  const chat = await Chat.findOne({
    _id: chatId,
    participants: req.user._id,
  });
  if (!chat) throw new ApiError(404, "Chat not found");
  const deletedChatEntry = chat.deletedFor.find(
    (item) => item.userId.toString() === req.user._id.toString(),
  );

  const skip = (page - 1) * limit;

  const messageFilter = {
    chatId,

    deletedFor: {
      $not: {
        $elemMatch: {
          userId: req.user._id,
        },
      },
    },

    // ✅ show only new messages after chat deletion
    ...(deletedChatEntry?.deletedAt && {
      createdAt: {
        $gt: deletedChatEntry.deletedAt,
      },
    }),
  };
  const [messages, total] = await Promise.all([
    Message.find(messageFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "name avatar isOnline lastActiveAt"),
    Message.countDocuments(messageFilter), // Updated to use messageFilter
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages, // newest first — reverse in your Redux slice
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
        },
      },
      "Messages fetched successfully",
    ),
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }

  try {
    await Chat.findByIdAndUpdate(chatId, {
      $set: { [`unreadCounts.${req.user._id}`]: 0 },
    });

    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: req.user._id },
        status: { $ne: "read" },
      },
      { status: "read" },
    );
    const io = getIO();
    io.to(chatId).emit("messages_read", { chatId });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Messages marked as read"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
export const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (message.type !== "text") {
    throw new ApiError(400, "Only text messages can be edited");
  }

  message.content = content.trim();
  message.isEdited = true;
  await message.save();

  const populated = await Message.findById(message._id).populate(
    "senderId",
    "name avatar isOnline lastActiveAt",
  );

  const io = req.app.get("io");
  io.to(message.chatId.toString()).emit("message_edited", populated);

  res.status(200).json(new ApiResponse(200, populated, "Message updated"));
});

// ------------------------------------------------------
// DELETE FOR ME
// ------------------------------------------------------
export const deleteMessageForMe = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  const alreadyDeleted = message.deletedFor.some(
    (item) => item.userId.toString() === req.user._id.toString(),
  );

  if (!alreadyDeleted) {
    message.deletedFor.push({ userId: req.user._id });
    await message.save();
  }

  res.status(200).json(new ApiResponse(200, {}, "Message deleted for you"));
});

// ------------------------------------------------------
// DELETE FOR EVERYONE
// ------------------------------------------------------
export const deleteMessageForEveryone = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  message.deletedForEveryone = true;
  message.content = "";
  message.mediaUrl = "";
  await message.save();

  const io = req.app.get("io");
  io.to(message.chatId.toString()).emit("message_deleted", {
    messageId: message._id,
    chatId: message.chatId,
    deletedForEveryone: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted for everyone"));
});
