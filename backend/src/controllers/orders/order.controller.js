import Order from "../../models/order.model.js";
import { Customer } from "../../models/customer.model.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

// ─────────────────────────────────────────────
// Internal Helper: Resolve Profile IDs
//
// The auth middleware gives us req.user._id (User ObjectId).
// The Order model stores Customer and ServiceProvider
// profile ObjectIds — not the base User _id.
// These helpers do ONE targeted query to translate
// between them, and throw clearly if no profile exists.
// ─────────────────────────────────────────────

const getCustomerProfileId = async (userId) => {
  const customer = await Customer.findOne({ user: userId }).select("_id");
  if (!customer) {
    throw new ApiError(404, "Customer profile not found. Please complete your profile first.");
  }
  return customer._id;
};

const getProviderProfileId = async (userId) => {
  const provider = await ServiceProvider.findOne({ user: userId }).select("_id");
  if (!provider) {
    throw new ApiError(404, "Service provider profile not found.");
  }
  return provider._id;
};

// ─────────────────────────────────────────────
// Internal Helper: Fetch order and verify access
//
// Centralises the "does this user belong to this order"
// check so every controller doesn't repeat it.
// ─────────────────────────────────────────────
const getOrderOrThrow = async (orderId, callerProfileId, role) => {
  const order = await Order.findById(orderId)
    .populate({
      path: "customerId",
      populate: { path: "user", select: "name avatar email phone location" } 
    })
    .populate({
      path: "serviceProviderId",
      populate: { path: "user", select: "name avatar email phone" } 
    })
    .populate("gigId",            "title hourlyRate inspectionRate");

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  const isCustomer  = order.customerId?._id?.toString()        === callerProfileId.toString();
  const isProvider  = order.serviceProviderId?._id?.toString() === callerProfileId.toString();

  // Role-aware access: some actions are provider-only; others are open to both
  if (role === "provider" && !isProvider) {
    throw new ApiError(403, "Access denied. You are not the provider on this order.");
  }
  if (role === "customer" && !isCustomer) {
    throw new ApiError(403, "Access denied. You are not the customer on this order.");
  }
  if (role === "either" && !isCustomer && !isProvider) {
    throw new ApiError(403, "Access denied. You are not a party to this order.");
  }

  return { order, isCustomer, isProvider };
};

// ─────────────────────────────────────────────
// @desc    Create a new order
// @route   POST /api/v1/orders
// @access  Private (role: customer)
// ─────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const {
    serviceProviderId,
    gigId,
    orderType,
    requirements,
    scheduledDate,
    serviceLocation,
    // UrgentHire fields
    responseTimeLimit,
    isUrgent,
    // InspectionHire fields
    inspectionTime,
    inspectionNotes,
  } = req.body;

  // ── Required field validation ──────────────────────────────────
  if (!serviceProviderId) throw new ApiError(400, "serviceProviderId is required.");
  if (!gigId)             throw new ApiError(400, "gigId is required.");
  if (!orderType)         throw new ApiError(400, "orderType is required.");
  if (!serviceLocation)   throw new ApiError(400, "serviceLocation is required.");

  const validOrderTypes = ["DirectHire", "UrgentHire", "InspectionHire"];
  if (!validOrderTypes.includes(orderType)) {
    throw new ApiError(400, `orderType must be one of: ${validOrderTypes.join(", ")}.`);
  }

  // ── Resolve caller's Customer profile ID ───────────────────────
  const customerProfileId = await getCustomerProfileId(req.user._id);

  // ── Prevent self-ordering ──────────────────────────────────────
  if (serviceProviderId.toString() === customerProfileId.toString()) {
    throw new ApiError(400, "You cannot place an order with yourself.");
  }

  // Ensure the target provider profile actually exists
  const providerExists = await ServiceProvider.findById(serviceProviderId).select("_id");
  if (!providerExists) {
    throw new ApiError(404, "Service provider not found.");
  }

  // ── OrderType-specific field validation ────────────────────────
  if (orderType === "UrgentHire") {
    if (!responseTimeLimit) throw new ApiError(400, "responseTimeLimit is required for UrgentHire.");
  }
  if (orderType === "InspectionHire") {
    if (!inspectionTime) throw new ApiError(400, "inspectionTime is required for InspectionHire.");
  }

  // ── Upload order reference images (if any) ─────────────────────
  const orderImages = [];
  if (req.files?.orderImages?.length) {
    for (const file of req.files.orderImages) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "orders/images",
      });
      if (uploaded?.secure_url) {
        orderImages.push(uploaded.secure_url);
      }
    }
  }

  // ── Build and persist the Order document ───────────────────────
  const order = await Order.create({
    customerId:        customerProfileId,
    serviceProviderId,
    gigId,
    orderType,
    requirements,
    scheduledDate,
    serviceLocation,
    orderImages,
    // UrgentHire fields (model's pre-validate hook nullifies these
    // automatically if the orderType doesn't call for them)
    responseTimeLimit: responseTimeLimit || null,
    isUrgent:          isUrgent          ?? null,
    // InspectionHire fields
    inspectionTime:    inspectionTime    || null,
    inspectionNotes:   inspectionNotes   || null,
    status:            "pending",
  });

  res.status(201).json(
    new ApiResponse(201, order, "Order placed successfully.")
  );
});

// ─────────────────────────────────────────────
// @desc    Get all orders for the logged-in user
// @route   GET /api/v1/orders
// @access  Private (customer or provider)
// ─────────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  // Resolve profile ID based on the caller's role
  let query;
  if (req.user.role === "customer") {
    const customerProfileId = await getCustomerProfileId(req.user._id);
    query = { customerId: customerProfileId };
  } else if (req.user.role === "serviceprovider") {
    const providerProfileId = await getProviderProfileId(req.user._id);
    query = { serviceProviderId: providerProfileId };
  } else {
    // Admin or other roles — see all (extend as needed)
    query = {};
  }

  // Optional status filter
  if (status) {
    const validStatuses = ["pending", "accepted", "rejected", "in-progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status filter. Must be one of: ${validStatuses.join(", ")}.`);
    }
    query.status = status;
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate("customerId",        "user")
    .populate({
      path: "serviceProviderId",
      select: "skills averageRating",
      populate: {
        path: "user",
        select: "name avatar" 
      }
  })
    .populate("gigId",             "title hourlyRate inspectionRate")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, "Orders fetched successfully.")
  );
});

// ─────────────────────────────────────────────
// @desc    Get a single order by ID
// @route   GET /api/v1/orders/:orderId
// @access  Private (customer or provider on this order)
// ─────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Resolve caller's profile ID based on their role
  let callerProfileId;
  if (req.user.role === "customer") {
    callerProfileId = await getCustomerProfileId(req.user._id);
  } else {
    callerProfileId = await getProviderProfileId(req.user._id);
  }

  const { order } = await getOrderOrThrow(orderId, callerProfileId, "either");

  res.status(200).json(
    new ApiResponse(200, order, "Order fetched successfully.")
  );
});

// ─────────────────────────────────────────────
// @desc    Accept or reject a pending order
// @route   PATCH /api/v1/orders/:orderId/respond
// @access  Private (service provider on this order)
// ─────────────────────────────────────────────
const respondToOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { action, cancellationReason } = req.body;

  if (!action) throw new ApiError(400, "action is required ('accept' or 'reject').");
  if (!["accept", "reject"].includes(action)) {
    throw new ApiError(400, "action must be 'accept' or 'reject'.");
  }
  if (action === "reject" && !cancellationReason?.trim()) {
    throw new ApiError(400, "cancellationReason is required when rejecting an order.");
  }

  const providerProfileId          = await getProviderProfileId(req.user._id);
  const { order }                  = await getOrderOrThrow(orderId, providerProfileId, "provider");

  // ── State machine guard ────────────────────────────────────────
  if (order.status !== "pending") {
    throw new ApiError(409, `Cannot respond to an order with status '${order.status}'. Order must be 'pending'.`);
  }

  if (action === "accept") {
    order.status = "accepted";
  } else {
    order.status             = "rejected";
    order.cancellationReason = cancellationReason.trim();
    order.cancelledBy        = providerProfileId;
  }

  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, `Order ${action === "accept" ? "accepted" : "rejected"} successfully.`)
  );
});

// ─────────────────────────────────────────────
// @desc    Mark an accepted order as in-progress
// @route   PATCH /api/v1/orders/:orderId/start
// @access  Private (service provider on this order)
// ─────────────────────────────────────────────
const startWork = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const providerProfileId = await getProviderProfileId(req.user._id);
  const { order }         = await getOrderOrThrow(orderId, providerProfileId, "provider");

  // ── State machine guard ────────────────────────────────────────
  if (order.status !== "accepted") {
    throw new ApiError(409, `Cannot start work on an order with status '${order.status}'. Order must be 'accepted'.`);
  }

  order.status = "in-progress";
  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, "Order marked as in-progress.")
  );
});

// ─────────────────────────────────────────────
// @desc    Complete an in-progress order and record billing
// @route   PATCH /api/v1/orders/:orderId/complete
// @access  Private (service provider on this order)
// ─────────────────────────────────────────────
const completeOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { hoursWorked, hourlyRate, finalDescription } = req.body;

  // ── Billing field validation ───────────────────────────────────
  if (hoursWorked == null) throw new ApiError(400, "hoursWorked is required to complete an order.");
  if (hourlyRate  == null) throw new ApiError(400, "hourlyRate is required to complete an order.");
  if (Number(hoursWorked) < 0) throw new ApiError(400, "hoursWorked cannot be negative.");
  if (Number(hourlyRate)  < 0) throw new ApiError(400, "hourlyRate cannot be negative.");

  const providerProfileId = await getProviderProfileId(req.user._id);
  const { order }         = await getOrderOrThrow(orderId, providerProfileId, "provider");

  // ── State machine guard ────────────────────────────────────────
  if (order.status !== "in-progress") {
    throw new ApiError(409, `Cannot complete an order with status '${order.status}'. Order must be 'in-progress'.`);
  }

  order.status           = "completed";
  order.hoursWorked      = Number(hoursWorked);
  order.hourlyRate       = Number(hourlyRate);
  order.totalAmount      = Number(hoursWorked) * Number(hourlyRate);
  order.finalDescription = finalDescription?.trim() || null;

  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, "Order marked as completed.")
  );
});

// ─────────────────────────────────────────────
// @desc    Cancel an order
// @route   PATCH /api/v1/orders/:orderId/cancel
// @access  Private (customer or provider on this order)
// ─────────────────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason } = req.body;

  if (!cancellationReason?.trim()) {
    throw new ApiError(400, "cancellationReason is required to cancel an order.");
  }

  // Resolve the caller's profile ID based on their role
  let callerProfileId;
  if (req.user.role === "customer") {
    callerProfileId = await getCustomerProfileId(req.user._id);
  } else {
    callerProfileId = await getProviderProfileId(req.user._id);
  }

  const { order } = await getOrderOrThrow(orderId, callerProfileId, "either");

  // ── State machine guard ────────────────────────────────────────
  const nonCancellableStatuses = ["completed", "rejected", "cancelled"];
  if (nonCancellableStatuses.includes(order.status)) {
    throw new ApiError(409, `Cannot cancel an order with status '${order.status}'.`);
  }

  order.status             = "cancelled";
  order.cancellationReason = cancellationReason.trim();
  order.cancelledBy        = callerProfileId;

  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, "Order cancelled successfully.")
  );
});

export {
  createOrder,
  getOrders,
  getOrderById,
  respondToOrder,
  startWork,
  completeOrder,
  cancelOrder,
};
