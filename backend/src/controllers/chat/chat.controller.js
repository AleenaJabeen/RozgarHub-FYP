import mongoose from "mongoose";
import { Chat } from "../../models/chat.model.js";
import { Message } from "../../models/message.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";


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
        participants: participants.map(
          (id) => new mongoose.Types.ObjectId(id)
        ),
        gigId,
        chatKey,
      },
    },

    {
      new: true,
      upsert: true,
    }
  )
    .populate("participants", "name")
    .populate({
      path: "lastMessage",
      populate: {
        path: "senderId",
        select: "name",
      },
    });

  return res.status(200).json(
    new ApiResponse(
      200,
      chat,
      "Chat fetched successfully"
    )
  );
});

export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name avatar" )
    .populate("gigId", "title images")
    .populate({
      path: "lastMessage",
      populate: { path: "senderId", select: "name avatar" },
    });

  return res
    .status(200)
    .json(new ApiResponse(200, chats, "Chats fetched successfully"));
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

  await Message.deleteMany({ chatId });
  await Chat.findByIdAndDelete(chatId);

  res.status(200).json(
    new ApiResponse(200, {}, "Chat deleted successfully")
  );
});