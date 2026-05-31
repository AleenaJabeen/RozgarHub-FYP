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
  );

  const deletedEntry = chat.deletedFor.find(
    (d) => d.userId.toString() === myId,
  );

  if (deletedEntry) {
    deletedEntry.manuallyRestored = true;
    await chat.save();
  }

  await chat.populate("participants", "name");
  await chat.populate({
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
  let chats = await Chat.find({
    participants: req.user._id,
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name avatar isOnline lastActiveAt")
    .populate("gigId", "title images");

  const userId = req.user._id.toString();

  const filteredChats = await Promise.all(
    chats.map(async (chat) => {
      const deletedEntry = chat.deletedFor.find(
        (d) => d.userId.toString() === userId
      );

      const lastMsgTime = chat.lastMessageAt;

      // hide chat if deleted and no valid restoration
      if (
        deletedEntry &&
        !deletedEntry.manuallyRestored &&
        lastMsgTime &&
        new Date(lastMsgTime) <= new Date(deletedEntry.deletedAt)
      ) {
        return null;
      }

      const plain = chat.toObject();

const lastMessage = await Message.findOne({
  chatId: chat._id,
  deletedFor: {
    $not: {
      $elemMatch: {
        userId: req.user._id
      }
    }
  },
  ...(deletedEntry?.deletedAt && {
    createdAt: { $gt: deletedEntry.deletedAt }
  })
})
.sort({ createdAt: -1 })
.populate("senderId", "name avatar isOnline lastActiveAt");

plain.lastMessage = lastMessage;
plain.lastMessageAt = lastMessage?.createdAt || null;

return plain;
    })
  );
  console.log("Filtered Chats:", filteredChats); // Debug log to check the final chat list after filtering

  return res.status(200).json(
    new ApiResponse(
      200,
      filteredChats.filter(Boolean),
      "Chats fetched successfully"
    )
  );
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
    existingEntry.manuallyRestored = false;
    existingEntry.deletedAt = new Date();
  } else {
    chat.deletedFor.push({
      userId: req.user._id,
      deletedAt: new Date(),
      manuallyRestored: false,
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
