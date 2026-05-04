import mongoose from "mongoose";
import { Chat } from "../../models/chat.model.js";
import { Message } from "../../models/message.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { participantId, gigId } = req.body;
  const myId = req.user._id;

  if (!participantId || !gigId) {
    throw new ApiError(400, "participantId and gigId are required");
  }
  if (participantId === myId.toString()) {
    throw new ApiError(400, "You cannot chat with yourself");
  }

  const participants = [myId.toString(), participantId].sort(); // sort for consistent uniqueness

  let chat = await Chat.findOne({
    participants: { $all: participants, $size: 2 },
    gigId,
  })
    .populate("participants", "name")
    .populate({
      path: "lastMessage",
      populate: { path: "senderId", select: "name" },
    });

  if (!chat) {
    chat = await Chat.create({
      participants: participants.map((id) => new mongoose.Types.ObjectId(id)),
      gigId,
    });
    await chat.populate("participants", "name");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Chat fetched successfully"));
});

export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name")
    .populate("gigId", "title images")
    .populate({
      path: "lastMessage",
      populate: { path: "senderId", select: "name" },
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