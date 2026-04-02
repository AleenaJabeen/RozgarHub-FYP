import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const serviceLocationSchema = new Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, required: [true, "City is required"], trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Geospatial coordinates are required."],
        validate: {
          validator: (v) =>
            Array.isArray(v) && v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 &&
            v[1] >= -90  && v[1] <= 90,
          message: "Coordinates must be a valid [longitude, latitude] pair.",
        },
      },
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    // ── Relationships ──
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An order must belong to a customer."],
      index: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An order must be assigned to a provider."],
      index: true,
    },
    gig: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: [true, "An order must reference a gig."],
      index: true,
    },

    // ── Job Details ──
    orderType: {
      type: String,
      enum: ["hourly", "inspection"],
      required: [true, "Order type is required."],
    },
    requirements: {
      type: String,
      trim: true,
      maxlength: [1000, "Requirements cannot exceed 1000 characters."],
    },
    hoursWorked: {
      type: Number,
      min: [0, "Hours worked cannot be negative."],
      default: null, // Only used if orderType is 'hourly'
    },
    scheduledDate: {
      type: Date,
      required: [true, "A scheduled date is required."],
    },
    serviceLocation: {
      type: serviceLocationSchema,
      required: [true, "A service location is required."],
    },

    // ── Financials ──
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
    paymentMethod: {
      type: String,
      enum:  ["online transaction"],
      required: [true, "Payment method is required."],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "escrow", "released", "refunded"],
      default: "pending",
      index: true,
    },

    // ── Status & Lifecycle ──
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in-progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500],
      default: null,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Reviews ──
    isReviewedByCustomer: { type: Boolean, default: false },
    isReviewedByProvider: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──
orderSchema.index({ provider: 1, status: 1, createdAt: -1 });
orderSchema.index({ customer: 1, status: 1, createdAt: -1 });
orderSchema.index({ "serviceLocation.coordinates": "2dsphere" });

// ── Pre-Save Hooks ──
orderSchema.pre("save", function (next) {
  // Clear hours worked if not an hourly job
  if (this.orderType !== "hourly" && this.hoursWorked != null) {
    this.hoursWorked = null;
  }
  next();
});

// ── Plugins ──
orderSchema.plugin(mongooseAggregatePaginate);

export const Order = mongoose.model("Order", orderSchema);