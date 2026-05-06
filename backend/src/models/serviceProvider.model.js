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
  { _id: false },
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
    education: {
      type: String,
      trim: true,
    },
    experienceDetails: {
      type: String,
      trim: true,
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

    // GeoJSON Point — stores the provider's physical location for
    // $near radius queries when dispatching urgent broadcast alerts.
    // Updated whenever the provider goes online via the app.
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
  },
  { timestamps: true },
);

serviceProviderSchema.index({ skills: 1 });
serviceProviderSchema.index({ urgentHire: 1 });
serviceProviderSchema.index({ location: "2dsphere" });

export const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema,
);
