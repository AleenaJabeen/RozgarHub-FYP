import mongoose from "mongoose";

const deletedForSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "A chat must have exactly 2 participants",
      },
    },

    chatKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },


    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
      index: true,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageAt: {
      type: Date,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    deletedFor: [deletedForSchema],
  },
  { timestamps: true },
);

export const Chat = mongoose.model("Chat", chatSchema);
