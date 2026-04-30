import mongoose from "mongoose";

const deletedForSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "audio"],
      required: true,
    },

    content: {
      type: String, // text OR caption
    },

    mediaUrl: {
      type: String, // image/video/audio URL (Cloudinary etc.)
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },

    deletedForEveryone: {
      type: Boolean,
      default: false,
    },

    deletedFor: [deletedForSchema],
  },
  { timestamps: true }
);
messageSchema.index({ chatId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);