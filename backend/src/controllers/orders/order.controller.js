import Order from "../../models/order.model.js";
import { Customer } from "../../models/customer.model.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { getIo } from "../../utils/socket.js";

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
    .populate("gigId", "title hourlyRate inspectionRate");

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  const isCustomer  = order.customerId?._id?.toString() === callerProfileId.toString();
  const isProvider  = order.serviceProviderId?._id?.toString() === callerProfileId.toString();

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

const parseTimeLimit = (timeStr) => {
  if (!timeStr) return 30;
  const str = timeStr.toLowerCase();
  const num = parseInt(str.match(/\d+/)?.[0] || 30, 10);
  if (str.includes("hour") || str.includes("hr")) return num * 60;
  return num;
};

const createOrder = asyncHandler(async (req, res) => {
  const {
    serviceProviderId,
    gigId,
    orderType,
    requirements,
    scheduledDate,
    serviceLocation,
    isBroadcast,
    requestTitle,
    category,
    responseTimeLimit,
    isUrgent,
    inspectionTime,
    inspectionNotes,
    longitude, // NEW: Expecting coordinates from frontend
    latitude   // NEW: Expecting coordinates from frontend
  } = req.body;

  const isBroadcastFlag = isBroadcast === "true" || isBroadcast === true;

  if (!orderType) throw new ApiError(400, "orderType is required.");
  if (!serviceLocation) throw new ApiError(400, "serviceLocation is required.");

  const validOrderTypes = ["DirectHire", "UrgentHire", "InspectionHire"];
  if (!validOrderTypes.includes(orderType)) {
    throw new ApiError(400, `orderType must be one of: ${validOrderTypes.join(", ")}.`);
  }

  if (isBroadcastFlag) {
    if (!requestTitle) throw new ApiError(400, "requestTitle is required for urgent broadcasts.");
    if (!category) throw new ApiError(400, "category is required for urgent broadcasts.");
    if (!longitude || !latitude) throw new ApiError(400, "GPS coordinates (longitude, latitude) are required for urgent broadcasts.");
  } else {
    if (!serviceProviderId) throw new ApiError(400, "serviceProviderId is required for direct hires.");
    if (!gigId) throw new ApiError(400, "gigId is required for direct hires.");
  }

  const customerProfileId = await getCustomerProfileId(req.user._id);

  if (!isBroadcastFlag) {
    if (serviceProviderId.toString() === customerProfileId.toString()) {
      throw new ApiError(400, "You cannot place an order with yourself.");
    }

    const providerExists = await ServiceProvider.findById(serviceProviderId).select("_id");
    if (!providerExists) {
      throw new ApiError(404, "Service provider not found.");
    }
  }

  if (orderType === "UrgentHire") {
    if (!responseTimeLimit) throw new ApiError(400, "responseTimeLimit is required for UrgentHire.");
  }

  const orderImages = [];
  if (req.files?.orderImages?.length) {
    for (const file of req.files.orderImages) {
      const uploaded = await uploadOnCloudinary(file.path, { folder: "orders/images" });
      if (uploaded?.secure_url) orderImages.push(uploaded.secure_url);
    }
  }

  // Create Order with GeoJSON Point
  const orderData = {
    customerId:        customerProfileId,
    serviceProviderId: serviceProviderId || null,
    gigId:             gigId || null,
    isBroadcast:       isBroadcastFlag,
    requestTitle:      requestTitle || null,
    category:          category || null,
    orderType,
    requirements,
    scheduledDate:     scheduledDate || null,
    serviceLocation,
    orderImages,
    responseTimeLimit: responseTimeLimit || null,
    isUrgent:          isUrgent ?? null,
    inspectionTime:    inspectionTime || null,
    inspectionNotes:   inspectionNotes || null,
    status:            "pending",
  };

  if (isBroadcastFlag && longitude && latitude) {
    orderData.location = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)]
    };
  }

  const order = await Order.create(orderData);

  if (isBroadcastFlag && category) {
    try {
      const targetMinutes = parseTimeLimit(responseTimeLimit);
      
      // Calculate max distance: 30km (30,000 meters) per 60 minutes.
      const maxDistanceMeters = (targetMinutes / 60) * 30000;

      // GEOSPATIAL QUERY: Find SPs within the calculated radius
      const nearbyProviders = await ServiceProvider.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
            $maxDistance: maxDistanceMeters
          }
        }
      }).select("user");

      const io = getIo();
      
      nearbyProviders.forEach(provider => {
        io.to(`provider_${provider.user.toString()}`).emit("new_urgent_request", order);
      });

      const halfTimeMs = (targetMinutes / 2) * 60 * 1000;
      setTimeout(async () => {
        try {
          const checkOrder = await Order.findById(order._id);
          if (checkOrder && checkOrder.status === "pending") {
            checkOrder.status = "cancelled";
            checkOrder.cancellationReason = `Auto-cancelled: Not accepted within half the target time (${targetMinutes / 2} mins).`;
            await checkOrder.save();
            io.emit("order_auto_cancelled", checkOrder._id);
          }
        } catch (err) {
          console.error("Auto-cancel failed:", err);
        }
      }, halfTimeMs);

    } catch (socketErr) {
      console.error("Socket emission or GeoQuery failed:", socketErr);
    }
  }

  res.status(201).json(new ApiResponse(201, order, isBroadcastFlag ? "Broadcast sent to nearby providers." : "Order placed successfully."));
});

const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query;
  if (req.user.role === "customer") {
    const customerProfileId = await getCustomerProfileId(req.user._id);
    query = { customerId: customerProfileId };
  } else if (req.user.role === "serviceprovider") {
    const providerProfileId = await getProviderProfileId(req.user._id);
    query = { serviceProviderId: providerProfileId };
  } else {
    query = {};
  }

  if (status) {
    const validStatuses = ["pending", "accepted", "rejected", "in-progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status filter.`);
    }
    query.status = status;
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate({
      path: "customerId",
      populate: {
        path: "user",
        select: "name avatar" 
      }
    })
    .populate({
      path: "serviceProviderId",
      select: "skills averageRating",
      populate: {
        path: "user",
        select: "name avatar" 
      }
    })
    .populate("gigId", "title hourlyRate inspectionRate")
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

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

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

  const providerProfileId = await getProviderProfileId(req.user._id);
  const { order } = await getOrderOrThrow(orderId, providerProfileId, "provider");

  if (order.status !== "pending") {
    throw new ApiError(409, `Cannot respond to an order with status '${order.status}'.`);
  }

  if (action === "accept") {
    order.status = "accepted";
  } else {
    order.status = "rejected";
    order.cancellationReason = cancellationReason.trim();
    order.cancelledBy = providerProfileId;
  }

  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, `Order ${action === "accept" ? "accepted" : "rejected"} successfully.`)
  );
});

const startWork = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const providerProfileId = await getProviderProfileId(req.user._id);
  const { order } = await getOrderOrThrow(orderId, providerProfileId, "provider");

  if (order.status !== "accepted") {
    throw new ApiError(409, `Cannot start work on an order with status '${order.status}'.`);
  }

  if (order.isBroadcast && order.responseTimeLimit) {
    const targetMinutes = parseTimeLimit(order.responseTimeLimit);
    const elapsedMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

    if (elapsedMinutes > targetMinutes) {
      const overTime = elapsedMinutes - targetMinutes;
      const penaltyIntervals = Math.floor(overTime / 10);
      order.latePenaltyDiscount = Math.min(penaltyIntervals * 10, 100); 
    }
  }

  order.status = "in-progress";
  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, "Order marked as in-progress.")
  );
});

const completeOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { hoursWorked, hourlyRate, finalDescription } = req.body;

  if (hoursWorked == null) throw new ApiError(400, "hoursWorked is required.");
  if (hourlyRate  == null) throw new ApiError(400, "hourlyRate is required.");
  if (Number(hoursWorked) < 0) throw new ApiError(400, "hoursWorked cannot be negative.");
  if (Number(hourlyRate)  < 0) throw new ApiError(400, "hourlyRate cannot be negative.");

  const providerProfileId = await getProviderProfileId(req.user._id);
  const { order } = await getOrderOrThrow(orderId, providerProfileId, "provider");

  if (order.status !== "in-progress") {
    throw new ApiError(409, `Cannot complete an order with status '${order.status}'.`);
  }

  order.status = "completed";
  order.hoursWorked = Number(hoursWorked);
  order.hourlyRate = Number(hourlyRate);
  
  let rawTotal = Number(hoursWorked) * Number(hourlyRate);
  if (order.latePenaltyDiscount > 0) {
    rawTotal = rawTotal - (rawTotal * (order.latePenaltyDiscount / 100));
  }
  
  order.totalAmount = rawTotal;
  order.finalDescription = finalDescription?.trim() || null;

  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, "Order marked as completed.")
  );
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason } = req.body;

  if (!cancellationReason?.trim()) {
    throw new ApiError(400, "cancellationReason is required.");
  }

  let callerProfileId;
  if (req.user.role === "customer") {
    callerProfileId = await getCustomerProfileId(req.user._id);
  } else {
    callerProfileId = await getProviderProfileId(req.user._id);
  }

  const { order } = await getOrderOrThrow(orderId, callerProfileId, "either");

  const nonCancellableStatuses = ["completed", "rejected", "cancelled"];
  if (nonCancellableStatuses.includes(order.status)) {
    throw new ApiError(409, `Cannot cancel an order with status '${order.status}'.`);
  }

  order.status = "cancelled";
  order.cancellationReason = cancellationReason.trim();
  order.cancelledBy = callerProfileId;

  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, "Order cancelled successfully.")
  );
});

const claimBroadcastOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { hourlyRate } = req.body; 

  if (!hourlyRate) {
    throw new ApiError(400, "You must provide an hourly rate to accept this request.");
  }

  const providerProfileId = await getProviderProfileId(req.user._id);

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.");
  
  if (!order.isBroadcast) {
    throw new ApiError(400, "This is not a broadcast order.");
  }

  if (order.serviceProviderId) {
    throw new ApiError(400, "This request has already been claimed.");
  }

  order.serviceProviderId = providerProfileId;
  order.hourlyRate = Number(hourlyRate); // <-- NEW: Save it to the order instantly
  order.status = "accepted";
  await order.save();

  try {
    const io = getIo();
    io.emit("broadcast_claimed", order._id);
  } catch (err) {
    console.error("Socket emission failed:", err);
  }

  res.status(200).json(
    new ApiResponse(200, order, "Urgent request claimed successfully.")
  );
});

const rebroadcastOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  let callerProfileId;
  if (req.user.role === "customer") {
    callerProfileId = await getCustomerProfileId(req.user._id);
  } else {
    throw new ApiError(403, "Only customers can rebroadcast orders.");
  }

  const { order } = await getOrderOrThrow(orderId, callerProfileId, "customer");

  if (!order.isBroadcast) throw new ApiError(400, "This is not a broadcast order.");
  if (order.status !== "pending" || order.serviceProviderId) throw new ApiError(400, "This order is no longer pending.");

  const currentCount = order.broadcastCount || 1;
  if (currentCount >= 3) throw new ApiError(400, "Maximum broadcast limit reached (3 tries).");

  const secondsSinceUpdate = (Date.now() - new Date(order.updatedAt).getTime()) / 1000;
  if (secondsSinceUpdate < 30) throw new ApiError(400, `Please wait ${Math.ceil(30 - secondsSinceUpdate)} seconds before rebroadcasting.`);

  order.broadcastCount = currentCount + 1;
  await order.save();

  try {
    const targetMinutes = parseTimeLimit(order.responseTimeLimit);
    const maxDistanceMeters = (targetMinutes / 60) * 30000;

    // Use the exact coordinates saved on the order from the first attempt
    const [lng, lat] = order.location.coordinates;

    const nearbyProviders = await ServiceProvider.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistanceMeters
        }
      }
    }).select("user");

    const io = getIo();
    nearbyProviders.forEach(provider => {
      io.to(`provider_${provider.user.toString()}`).emit("new_urgent_request", order);
    });

    const halfTimeMs = (targetMinutes / 2) * 60 * 1000;
    setTimeout(async () => {
      try {
        const checkOrder = await Order.findById(order._id);
        if (checkOrder && checkOrder.status === "pending") {
          checkOrder.status = "cancelled";
          checkOrder.cancellationReason = `Auto-cancelled: Not accepted within half the target time (${targetMinutes / 2} mins).`;
          await checkOrder.save();
          io.emit("order_auto_cancelled", checkOrder._id);
        }
      } catch (err) {
        console.error("Auto-cancel failed:", err);
      }
    }, halfTimeMs);

  } catch (err) {
    console.error("Socket emission failed:", err);
  }

  res.status(200).json(new ApiResponse(200, order, "Request rebroadcasted to nearby providers successfully."));
});

export {
  createOrder,
  getOrders,
  getOrderById,
  respondToOrder,
  startWork,
  completeOrder,
  cancelOrder,
  claimBroadcastOrder,
  rebroadcastOrder,
};