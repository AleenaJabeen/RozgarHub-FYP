import mongoose from "mongoose";

const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer reference is required."],
      index: true,
    },
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: [
        function () { return !this.isBroadcast; },
        "ServiceProvider reference is required for direct hires.",
      ],
      index: true,
    },
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: [
        function () { return !this.isBroadcast; },
        "Gig reference is required for direct hires.",
      ],
      index: true,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    broadcastCount: {
      type: Number,
      default: 1,
    },
    requestTitle: {
      type: String,
      trim: true,
      required: [
        function () { return this.isBroadcast; },
        "Request title is required for urgent broadcasts.",
      ],
    },
    category: {
      type: String,
      trim: true,
      required: [
        function () { return this.isBroadcast; },
        "Category is required for urgent broadcasts.",
      ],
    },
    orderType: {
      type: String,
      enum: {
        values: ["DirectHire", "UrgentHire", "InspectionHire"],
        message: '"{VALUE}" is not a valid order type.',
      },
      required: [true, "Order type is required."],
    },
    orderImages: {
      type: [String],
      default: [],
    },
    requirements: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: Date,
    },
    serviceLocation: {
      type: String,
      trim: true,
      required: [true, "Service location is required."],
    },
    
    // ─── NEW: Geospatial Location for 2dsphere ─────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      }
    },

    responseTimeLimit: {
      type: String,
      default: null,
    },
    isUrgent: {
      type: Boolean,
      default: null,
    },
    inspectionTime: {
      type: Date,
      default: null,
    },
    inspectionNotes: {
      type: String,
      trim: true,
      default: null,
    },
    hoursWorked: {
      type: Number,
      min: [0, "Hours worked cannot be negative."],
      default: null,
    },
    hourlyRate: {
      type: Number,
      min: [0, "Hourly rate cannot be negative."],
      default: null,
    },
    totalAmount: {
      type: Number,
      min: [0, "Total amount cannot be negative."],
      default: null,
    },
    finalDescription: {
      type: String,
      trim: true,
      default: null,
    },
    latePenaltyDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "accepted",
          "rejected",
          "in-progress",
          "completed",
          "cancelled",
        ],
        message: '"{VALUE}" is not a valid order status.',
      },
      default: "pending",
      index: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    isReviewedByCustomer: {
      type: Boolean,
      default: false,
    },
    isReviewedByProvider: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.pre("validate", function () {
  const type = this.orderType;

  if (type === "DirectHire") {
    this.responseTimeLimit = null;
    this.isUrgent = null;
    this.inspectionTime = null;
    this.inspectionNotes = null;
  } else if (type === "UrgentHire") {
    this.inspectionTime = null;
    this.inspectionNotes = null;
  } else if (type === "InspectionHire") {
    this.responseTimeLimit = null;
    this.isUrgent = null;
  }

  if (!this.isBroadcast) {
    this.requestTitle = null;
    this.category = null;
  }
});

// Adding a 2dsphere index on the order location for future geographic queries
orderSchema.index({ location: "2dsphere" });
orderSchema.index({ customerId: 1, gigId: 1 });
orderSchema.index({ serviceProviderId: 1, status: 1 });

const Order = model("Order", orderSchema);

export default Order;