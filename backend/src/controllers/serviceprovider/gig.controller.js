import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Gig } from "../../models/gig.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";

const checkIfWithinAvailability = (availabilityHours) => {
  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const currentTime = now.toTimeString().slice(0, 5);

  for (const slot of availabilityHours) {
    if (slot.days.includes(currentDay)) {
      if (currentTime >= slot.startTime && currentTime <= slot.endTime) {
        return true;
      }
    }
  }
  return false;
};

// Create Gig

export const createGig = asyncHandler(async (req, res) => {
  const { title, description, categoryId, hourlyRate, inspectionRate } =
    req.body;
  let { availabilityHours, subcategoryIds } = req.body;
  if (typeof availabilityHours === "string") {
    availabilityHours = JSON.parse(availabilityHours);
  }

  if (typeof subcategoryIds === "string") {
    subcategoryIds = JSON.parse(subcategoryIds);
  }

  const provider = await ServiceProvider.findOne({ user: req.user._id });
  if (!provider) {
    throw new ApiError(404, "Service Provider profile not found. Please complete your profile.");
  }

  let imageObjects = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "gigs",
      });

      if (uploaded?.secure_url) {
        imageObjects.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        });
      }
    }
  }

  const isAvailable = checkIfWithinAvailability(availabilityHours);

  const gig = await Gig.create({
    serviceProviderId: provider._id,
    title,
    description,
    images: imageObjects,
    categoryId,
    subcategories: subcategoryIds,
    hourlyRate,
    inspectionRate,
    availabilityHours,
    availabilityStatus: isAvailable ? "available" : "unavailable",
    statusMode: "auto",
    totalOrders: 0,
    totalReviews: 0,
    averageRating: 0,
  });
  console.log("Created Gig:", gig);
  return res
    .status(201)
    .json(new ApiResponse(201, gig, "Gig created successfully"));
});

//get all gigs of a provider

export const getMyGigs = asyncHandler(async (req, res) => {
  // 1. Find the provider profile linked to the logged-in user
  const provider = await ServiceProvider.findOne({ user: req.user._id });
  
  if (!provider) {
    return res.status(200).json(new ApiResponse(200, [], "Gigs fetched successfully"));
  }

  // 2. Fetch gigs using the correct Provider ID
  const gigs = await Gig.find({
    serviceProviderId: provider._id,
  })
    .populate("categoryId", "name")
    .populate({
      path: "serviceProviderId",
      populate: { path: "user", select: "name avatar" } // Deep populate for the SP dashboard card!
    });

  return res
    .status(200)
    .json(new ApiResponse(200, gigs, "Gigs fetched successfully"));
});

//get single gig of a provider

export const getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id)
  .populate("categoryId", "name")
  .populate({
      path: "serviceProviderId",
      populate: { path: "user", select: "name avatar isOnline" } 
    });

  if (!gig) {
    throw new ApiError(404, "Gig not found");
  }

  return res.status(200).json(new ApiResponse(200, gig, "Gig fetched"));
});

// ─────────────────────────────────────────────
// @desc    Search & filter public gigs for the marketplace
// @route   GET /api/v1/gigs/public
// @access  Public
// ─────────────────────────────────────────────
export const searchPublicGigs = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    status,
    sortBy,
    day,
    time,
    page  = 1,
    limit = 12,
  } = req.query;

  const query = {};

  // ── Text search on title and description ──────────────────────
  if (search?.trim()) {
    query.$or = [
      { title:       { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // ── Category filter ───────────────────────────────────────────
  if (category) {
    query.categoryId = category;
  }

  // ── Available / Unavailable status filter ───────────────────────
  if (status === "available") {
    query.availabilityStatus = "available";
  }

  // ── Availability Hours filter — day + time ────────────────────
  // Uses $elemMatch to find gigs where:
  //   1. The requested day is inside the `days` array
  //   2. The requested time (HH:MM) falls within startTime–endTime
  // Both conditions must hold on the SAME availability slot.
  if (day && time) {
    query.availabilityHours = {
      $elemMatch: {
        days:      day,          // e.g. "Monday"
        startTime: { $lte: time }, // "09:00" <= "14:00"
        endTime:   { $gte: time }, // "18:00" >= "14:00"
      },
    };
  } else if (day) {
    // Filter by day only when no time is supplied
    query.availabilityHours = {
      $elemMatch: { days: day },
    };
  }

  // ── Sorting ───────────────────────────────────────────────────
  let sort = {};
  switch (sortBy) {
    case "price_asc":    sort = { hourlyRate:    1  }; break;
    case "price_desc":   sort = { hourlyRate:   -1  }; break;
    case "rating_desc":  sort = { averageRating: -1 }; break;
    case "reviews_desc": sort = { totalReviews:  -1 }; break;
    default:             sort = { createdAt:     -1 };
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Gig.countDocuments(query);

  const gigs = await Gig.find(query)
    .populate({
      path: "serviceProviderId",
      select: "user skills averageRating totalReviews urgentHire",
      // Populate the nested User document so the frontend always gets
      // real name/avatar without falling back to placeholder values.
      populate: {
        path:   "user",
        select: "name avatar isOnline",
      },
    })
    .populate("categoryId", "name icon")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json(
    new ApiResponse(200, {
      gigs,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    }, "Gigs fetched successfully.")
  );
});

// delete gig

export const deleteGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    throw new ApiError(404, "Gig not found");
  }

  if (gig.serviceProviderId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (gig.images && gig.images.length > 0) {
    for (const image of gig.images) {
      await deleteFromCloudinary(image.public_id);
    }
  }

  await gig.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Gig deleted successfully"));
});

// manually set status to available/unavailable

export const setGigUnavailable = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) throw new ApiError(404, "Gig not found");

  const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (gig.serviceProviderId.toString() !== provider._id.toString()) {
      throw new ApiError(403, "Unauthorized");
    }

  gig.availabilityStatus = "unavailable";
  gig.statusMode = "manual";

  await gig.save();
  const populatedGig = await Gig.findById(gig._id)
  .populate("categoryId", "name")
  .populate("subcategories", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedGig, "Gig set to unavailable manually"));
});

export const setGigAvailable = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) throw new ApiError(404, "Gig not found");

  const provider = await ServiceProvider.findOne({ user: req.user._id });
  if (gig.serviceProviderId.toString() !== provider._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  gig.availabilityStatus = "available";
  gig.statusMode = "manual";

  await gig.save();
  const populatedGig = await Gig.findById(gig._id)
  .populate("categoryId", "name")
  .populate("subcategories", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedGig, "Gig set to available and auto mode enabled"));
});

//enabledauto mode when gig is updated
export const enableAutoMode = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) throw new ApiError(404, "Gig not found");

  gig.statusMode = "auto";

  const isAvailable = checkIfWithinAvailability(gig.availabilityHours);
  gig.availabilityStatus = isAvailable ? "available" : "unavailable";

  await gig.save();
  const populatedGig = await Gig.findById(gig._id)
  .populate("categoryId", "name")
  .populate("subcategories", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedGig, "Auto availability mode enabled"));
});

//update gig

export const updateGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) throw new ApiError(404, "Gig not found");

  const provider = await ServiceProvider.findOne({ user: req.user._id });
  if (gig.serviceProviderId.toString() !== provider._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  // ✅ STEP 1: store OLD images FIRST
  const oldImages = gig.images;

  let { availabilityHours } = req.body;
  if (typeof availabilityHours === "string") {
    availabilityHours = JSON.parse(availabilityHours);
  }

  let { title, description, hourlyRate, inspectionRate, subcategoryIds } =
    req.body;

  if (typeof subcategoryIds === "string") {
    subcategoryIds = JSON.parse(subcategoryIds);
  }

  if (title) gig.title = title;
  if (description) gig.description = description;
  if (hourlyRate) gig.hourlyRate = hourlyRate;
  if (inspectionRate) gig.inspectionRate = inspectionRate;
  if (availabilityHours) gig.availabilityHours = availabilityHours;
  if (subcategoryIds) gig.subcategories = subcategoryIds;

  // ✅ STEP 2: parse existing images from frontend
  let { existingImages } = req.body;
  if (typeof existingImages === "string") {
    existingImages = JSON.parse(existingImages);
  }

  // fallback safety
  if (!existingImages) existingImages = [];

  // ✅ STEP 3: detect deleted images BEFORE overwriting
  const oldPublicIds = oldImages.map((img) => img.public_id);
  const newPublicIds = existingImages.map((img) => img.public_id);

  const deletedImages = oldPublicIds.filter((id) => !newPublicIds.includes(id));

  // ✅ STEP 4: delete from cloudinary
  for (const public_id of deletedImages) {
    await deleteFromCloudinary(public_id);
  }

  // ✅ STEP 5: set remaining images
  gig.images = existingImages;

  // ✅ STEP 6: upload new images
  if (req.files && req.files.length > 0) {
    let newImages = [];

    for (const file of req.files) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "gigs",
      });

      if (uploaded?.secure_url) {
        newImages.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
        });
      }
    }

    gig.images = [...gig.images, ...newImages];
  }

  // ✅ AUTO MODE
  if (gig.statusMode === "auto") {
    const isAvailable = checkIfWithinAvailability(gig.availabilityHours);
    gig.availabilityStatus = isAvailable ? "available" : "unavailable";
  }

  await gig.save();
  const populatedGig = await Gig.findById(gig._id)
  .populate("categoryId", "name")
  .populate("subcategories", "name");

  return res.status(200).json(new ApiResponse(200, populatedGig, "Gig updated"));
});
