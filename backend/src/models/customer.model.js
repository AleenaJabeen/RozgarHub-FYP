import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A customer profile must be linked to a User account."],
      unique: true,
      index: true,
    },
    
    savedAddresses: [
      {
        type: String,
        trim: true,
      }
    ],

    savedGigs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Gig",
      },
    ],

    favoriteProviders: [
      {
        type: Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
    ],

    totalOrdersPlaced: {
      type: Number,
      default: 0,
      min: [0, "totalOrdersPlaced cannot be negative."],
    },
    
    stripeCustomerId: {
      type: String,
      trim: true,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

customerSchema.virtual("hasPaymentSetup").get(function () {
  return !!this.stripeCustomerId;
});

export const Customer = mongoose.model("Customer", customerSchema);