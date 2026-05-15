import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required."],
      index: true,
    },
    gigId: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
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
    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating cannot exceed 5."],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters."],
      default: "", 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent double reviews
reviewSchema.index({ orderId: 1, customerId: 1 }, { unique: true });

// ─── THE MAGIC HOOK: Auto-calculate Average Ratings ────────────────────────
reviewSchema.post("save", async function () {
  const Review = this.constructor;

  // 1. Calculate the new stats for the GIG
  const gigStats = await Review.aggregate([
    { $match: { gigId: this.gigId } },
    { $group: { _id: "$gigId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);

  // 2. Calculate the new stats for the SERVICE PROVIDER
  const spStats = await Review.aggregate([
    { $match: { serviceProviderId: this.serviceProviderId } },
    { $group: { _id: "$serviceProviderId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);

  if (gigStats.length > 0) {
    await mongoose.model("Gig").findByIdAndUpdate(this.gigId, {
      averageRating: Math.round(gigStats[0].avgRating * 10) / 10,
      totalReviews: gigStats[0].totalReviews,
    });
  }

  if (spStats.length > 0) {
    await mongoose.model("ServiceProvider").findByIdAndUpdate(this.serviceProviderId, {
      averageRating: Math.round(spStats[0].avgRating * 10) / 10,
      totalReviews: spStats[0].totalReviews,
    });
  }
});

const Review = model("Review", reviewSchema);
export default Review;