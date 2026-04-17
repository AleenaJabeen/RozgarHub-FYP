import mongoose from "mongoose";

const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    // ─── Core References ───────────────────────────────────────────────────────
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer reference is required."],
      index: true,
    },
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: [true, "ServiceProvider reference is required."],
      index: true,
    },
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: [true, "Gig reference is required."],
      index: true,
    },

    // ─── Order Classification ──────────────────────────────────────────────────
    orderType: {
      type: String,
      enum: {
        values: ["DirectHire", "UrgentHire", "InspectionHire"],
        message: '"{VALUE}" is not a valid order type.',
      },
      required: [true, "Order type is required."],
    },

    // ─── General Order Fields ──────────────────────────────────────────────────
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

    // ─── UrgentHire Fields ─────────────────────────────────────────────────────
    responseTimeLimit: {
      type: String,
      default: null,
    },
    isUrgent: {
      type: Boolean,
      default: null,
    },

    // ─── InspectionHire Fields ─────────────────────────────────────────────────
    inspectionTime: {
      type: Date,
      default: null,
    },
    inspectionNotes: {
      type: String,
      trim: true,
      default: null,
    },

    // ─── Billing / Work Completion Fields ─────────────────────────────────────
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

    // ─── Lifecycle / Status ────────────────────────────────────────────────────
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
    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      default: null,
      // Intentionally no ref — could be Customer or ServiceProvider
    },

    // ─── Review Flags ──────────────────────────────────────────────────────────
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
    timestamps: true, // adds createdAt & updatedAt automatically
    versionKey: false,
  }
);

// ─── Pre-validate Hook: Nullify fields that don't belong to the orderType ──────
//
// This is the single source of truth for field hygiene. Before Mongoose
// runs its validators, we clear any stale fields so no "ghost" data
// from a previous orderType ever gets persisted.
//
orderSchema.pre("validate", function (next) {
  const type = this.orderType;

  if (type === "DirectHire") {
    // UrgentHire-only fields
    this.responseTimeLimit = null;
    this.isUrgent = null;
    // InspectionHire-only fields
    this.inspectionTime = null;
    this.inspectionNotes = null;
  } else if (type === "UrgentHire") {
    // InspectionHire-only fields
    this.inspectionTime = null;
    this.inspectionNotes = null;
  } else if (type === "InspectionHire") {
    // UrgentHire-only fields
    this.responseTimeLimit = null;
    this.isUrgent = null;
  }

});

// ─── Compound Index ────────────────────────────────────────────────────────────
// Useful for dashboard queries: "all orders for a customer under a gig"
orderSchema.index({ customerId: 1, gigId: 1 });
orderSchema.index({ serviceProviderId: 1, status: 1 });

const Order = model("Order", orderSchema);

export default Order;
