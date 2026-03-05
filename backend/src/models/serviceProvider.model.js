import mongoose, { Schema } from "mongoose";

const experienceDocumentSchema = new Schema(
  {
    title: {
      type: String, // e.g. "Work Certificate - ABC Company"
      required: true,
    },
    documentUrl: {
      type: String, // Cloudinary URL
      required: true,
    },
  },
  { _id: false }
);

const serviceProviderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One provider profile per user
    },

    cnicNo: {
      type: String,
      required: true,
      unique: true,
    },

    cnicImg: {
      type: String, // Cloudinary URL
      required: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    experienceDocuments: [experienceDocumentSchema],

    certificates: [
      {
        type: String, // file URLs
      },
    ],

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    completedOrders: {
      type: Number,
      default: 0,
    },

    urgentHire: {
      type: Boolean,
      default: false,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

serviceProviderSchema.index({ skills: 1 });
serviceProviderSchema.index({ urgentHire: 1 });

export const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);