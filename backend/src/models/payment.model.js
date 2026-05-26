import mongoose from "mongoose";

const { Schema, model } = mongoose;

const paymentSchema = new Schema(
  {
    // ─── References ────────────────────────────────────────────────────────────
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required."],
      index: true,
    },
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

    // ─── Payment Details ───────────────────────────────────────────────────────
    amount: {
      type: Number,
      required: [true, "Payment amount is required."],
      min: [0, "Amount cannot be negative."],
    },
    paymentMethod: {
      type: String,
      trim: true,
      required: [true, "Payment method is required."],
      // e.g. "JazzCash", "EasyPaisa", "Card", "Cash" — kept as open String
      // so you don't need a migration every time a new gateway is added.
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "escrow", "released", "refunded"],
        message: '"{VALUE}" is not a valid payment status.',
      },
      default: "pending",
      index: true,
    },
    transactionReference: {
      type: String,
      trim: true,
      default: null,
      // Populated by the payment gateway after a successful transaction
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// One order should realistically produce one payment document.
// A unique index on orderId enforces that at the DB level.
paymentSchema.index({ orderId: 1 }, { unique: true });

const Payment = model("Payment", paymentSchema);

export default Payment;
