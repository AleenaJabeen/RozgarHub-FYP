import mongoose, { Schema } from "mongoose";

const availabilityHoursSchema = new Schema(
  {
    days: [
      {
        type: String, // e.g. "Monday"
        required: true,
      },
    ],
    startTime: {
      type: String, // "09:00"
      required: true,
    },
    endTime: {
      type: String, // "18:00"
      required: true,
    },
  },
  { _id: false },
);

const gigSchema = new Schema(
  {
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"]
    },

    description: {
      type: String,
      required: true,
      maxLength: [2000, "Description cannot exceed 2000 characters"]
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subcategories: [
      {
        type: String,
        required: true,
      },
    ],

    hourlyRate: {
      type: Number,
      required: true,
      min: [0, "Hourly rate cannot be negative"]
    },

    inspectionRate: {
      type: Number,
      default: 0,
      min: [0, "Inspection rate cannot be negative"]
    },

    availabilityStatus: {
      type: String,
      enum: ["available", "occupied", "unavailable"],
      default: "unavailable",
    },
    statusMode: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto",
    },

    availabilityHours: [availabilityHoursSchema],

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true },
);

// Index for faster search
gigSchema.index({ categoryId: 1 });
gigSchema.index({ serviceProviderId: 1 });
gigSchema.index({ title: "text", description: "text" });

export const Gig = mongoose.model("Gig", gigSchema);
