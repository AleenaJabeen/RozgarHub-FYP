import Review from "../../models/review.model.js";
import Order from "../../models/order.model.js";
import { Customer } from "../../models/customer.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getIO } from "../../socket/socket.js";
import { createNotification } from "../notification/notification.controller.js";
import { sendPushNotification } from "../../services/notification.service.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";

// @desc    Create a new review (Customer Only)
// @route   POST /api/v1/reviews
const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;
  
  // 1. Verify Customer
  const customer = await Customer.findOne({ user: req.user._id });
  if (!customer) {
    throw new ApiError(403, "Only customers can leave reviews.");
  }

  // 2. Verify Order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  // 3. Security Checks
  if (order.customerId.toString() !== customer._id.toString()) {
    throw new ApiError(403, "You can only review your own orders.");
  }
  if (order.status !== "completed") {
    throw new ApiError(400, "You can only review completed orders.");
  }

  // 4. Check for existing review
  const existingReview = await Review.findOne({ orderId, customerId: customer._id });
  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this order.");
  }

  // 5. Create Review
  const review = await Review.create({
    orderId,
    gigId: order.gigId,
    customerId: customer._id,
    serviceProviderId: order.serviceProviderId,
    rating,
    comment: comment || "",
  });

  // 6. Update order status
  await Order.findByIdAndUpdate(orderId, { isReviewed: true });
    // ================= REVIEW NOTIFICATION =================

  const io = getIO();

  const provider = await ServiceProvider.findById(
    order.serviceProviderId,
  ).populate("user", "name");

  const notification = await createNotification({
    recipient: provider.user._id,
    sender: req.user._id,
    type: "review",
    title: "New Review Received",
    message: `${req.user.name} left you a review.`,
    link: "/serviceprovider",
    metadata: {
      orderId: order._id,
      reviewId: review._id,
      rating,
    },
  });

  io.to(provider.user._id.toString()).emit(
    "new_notification",
    notification,
  );

  const isProviderOnline = io.sockets.adapter.rooms.has(
    provider.user._id.toString(),
  );

  if (!isProviderOnline) {
    await sendPushNotification({
      userId: provider.user._id,
      title: "New Review Received",
      body: `${req.user.name} left you a review.`,
      data: {
        type: "review",
        orderId: order._id.toString(),
        reviewId: review._id.toString(),
      },
    });
  }

  // 7. Send standard ApiResponse
  return res
    .status(201)
    .json(new ApiResponse(201, review, "Review submitted successfully!"));
});

// @desc    Get all reviews for a specific Gig
// @route   GET /api/v1/reviews/gig/:gigId
const getGigReviews = asyncHandler(async (req, res) => {
  const { gigId } = req.params;

  const reviews = await Review.find({ gigId })
    .populate({
      path: "customerId",
      populate: { path: "user" } 
    })
    .sort("-createdAt"); 

  return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

// @desc    Get all reviews for a specific Service Provider
// @route   GET /api/v1/reviews/provider/:providerId
 const getProviderReviews = asyncHandler(async (req, res) => {
  const { providerId } = req.params;

  const reviews = await Review.find({ serviceProviderId: providerId })
    .populate({
      path: "customerId",
      populate: { path: "user" } 
    })
    .populate("gigId", "title")
    .sort("-createdAt"); 

  return res.status(200).json(new ApiResponse(200, reviews, "Provider reviews fetched successfully"));
});

export { createReview, getGigReviews, getProviderReviews };