import mongoose from "mongoose";
import { Chat } from "../../models/chat.model.js";
import { Message } from "../../models/message.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { User } from "../../models/user.model.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";

export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { participantId, gigId } = req.body;

  const myId = req.user._id.toString();

  if (!participantId || !gigId) {
    throw new ApiError(400, "participantId and gigId are required");
  }

  if (participantId === myId) {
    throw new ApiError(400, "You cannot chat with yourself");
  }

  // stable order
  const participants = [myId, participantId].sort();

  // deterministic unique key
  const chatKey = `${participants[0]}:${participants[1]}:${gigId}`;

  const chat = await Chat.findOneAndUpdate(
    { chatKey },

    {
      $setOnInsert: {
        participants: participants.map((id) => new mongoose.Types.ObjectId(id)),
        gigId,
        chatKey,
      },
    },

    {
      new: true,
      upsert: true,
    },
  )
    .populate("participants", "name")
    .populate({
      path: "lastMessage",
      populate: {
        path: "senderId",
        select: "name",
      },
    });

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Chat fetched successfully"));
});

export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name avatar isOnline lastActiveAt")
    .populate("gigId", "title images")
    .populate({
      path: "lastMessage",
      populate: {
        path: "senderId",
        select: "name avatar isOnline lastActiveAt",
      },
    });
  const filteredChats = chats.filter((chat) => {
    const deletedEntry = chat.deletedFor.find(
      (d) => d.userId.toString() === req.user._id.toString(),
    );

    // never deleted
    if (!deletedEntry) return true;
    if (!chat.lastMessage) return false;

    // show chat only if new message arrived
    return new Date(chat.lastMessageAt) > new Date(deletedEntry.deletedAt);
  });

  return res
    .status(200)
    .json(new ApiResponse(200, filteredChats, "Chats fetched successfully"));
});

export const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findOne({
    _id: chatId,
    participants: req.user._id,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  const existingEntry = chat.deletedFor.find(
    (d) => d.userId.toString() === req.user._id.toString(),
  );

  if (existingEntry) {
    // 🔥 IMPORTANT: refresh deletion timestamp
    existingEntry.deletedAt = new Date();
  } else {
    chat.deletedFor.push({
      userId: req.user._id,
      deletedAt: new Date(),
    });
  }

  await chat.save();
  const shouldPermanentlyDeleteChat = (chat) => {
    if (chat.deletedFor.length !== 2) return false;

    const lastMsgTime = chat.lastMessageAt || new Date(0);

    return chat.deletedFor.every(
      (d) => new Date(d.deletedAt) >= new Date(lastMsgTime),
    );
  };
  if (shouldPermanentlyDeleteChat(chat)) {
    await Message.deleteMany({ chatId: chat._id });
    await Chat.findByIdAndDelete(chat._id);
  }

  res.status(200).json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Fetch core user data
    const user = await User.findById(userId).select(
      "name email avatar location isPhoneVerified role createdAt",
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 2. Prepare the response object
    let responseData = {
      ...user._doc,
    };

    // 3. If the role is service provider, fetch extra fields from ServiceProvider schema
    if (user.role === "serviceprovider") {
      const providerDetails = await ServiceProvider.findOne({
        userId: user._id,
      }).select("averageRating completedOrders bio");

      if (providerDetails) {
        responseData.professionalDetails = {
          averageRating: providerDetails.averageRating || 0,
          completedOrders: providerDetails.completedOrders || 0,
          bio: providerDetails.bio || "No bio provided.",
        };
      }
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, responseData, "User Info fetched successfully"),
      );
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    throw new ApiError(500, "Server error while fetching user info");
  }
};
