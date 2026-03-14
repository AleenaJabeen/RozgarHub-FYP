import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Gig } from "../../models/gig.model.js";
import { Category } from "../../models/category.model.js";  
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";

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
  const {
    title,
    description,
    categoryId,
    hourlyRate,
    inspectionRate,
  } = req.body;
  let { availabilityHours } = req.body;
  if (typeof availabilityHours === "string") {
    availabilityHours = JSON.parse(availabilityHours);
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
  
  const isOnline = checkIfWithinAvailability(availabilityHours);

  const gig = await Gig.create({
    serviceProviderId: req.user._id,
    title,
    description,
    images: imageObjects,
    categoryId,
    hourlyRate,
    inspectionRate,
    availabilityHours,
    availabilityStatus: isOnline ? "online" : "offline",
    statusMode: "auto",

    totalOrders: 0,
  totalReviews: 0,
  averageRating: 0,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, gig, "Gig created successfully"));
});

//get all gigs of a provider

export const getMyGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find({
  serviceProviderId: req.user._id,
}).populate("categoryId", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, gigs, "Gigs fetched successfully"));
});

//get single gig of a provider

export const getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    throw new ApiError(404, "Gig not found");
  }

  return res.status(200).json(new ApiResponse(200, gig, "Gig fetched"));
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

// manually set status to online/offline

export const setGigOffline = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) throw new ApiError(404, "Gig not found");

  if (gig.serviceProviderId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  gig.availabilityStatus = "offline";
  gig.statusMode = "manual";

  await gig.save();

  return res
    .status(200)
    .json(new ApiResponse(200, gig, "Gig set to offline manually"));
});

export const setGigOnline = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) throw new ApiError(404, "Gig not found");

  if (gig.serviceProviderId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  gig.availabilityStatus = "online";
  gig.statusMode = "manual";

  await gig.save();

  return res
    .status(200)
    .json(new ApiResponse(200, gig, "Gig set to online and auto mode enabled"));
});

//enabledauto mode when gig is updated
export const enableAutoMode = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) throw new ApiError(404, "Gig not found");

  gig.statusMode = "auto";

  const isOnline = checkIfWithinAvailability(gig.availabilityHours);
  gig.availabilityStatus = isOnline ? "online" : "offline";

  await gig.save();

  return res
    .status(200)
    .json(new ApiResponse(200, gig, "Auto availability mode enabled"));
});

//update gig

export const updateGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) throw new ApiError(404, "Gig not found");

  if (gig.serviceProviderId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  let { availabilityHours } = req.body;

if (typeof availabilityHours === "string") {
  availabilityHours = JSON.parse(availabilityHours);
}
const {
  title,
  description,
  categoryId,
  hourlyRate,
  inspectionRate,
} = req.body;

if (title) gig.title = title;
if (description) gig.description = description;
if (categoryId) gig.categoryId = categoryId;
if (hourlyRate) gig.hourlyRate = hourlyRate;
if (inspectionRate) gig.inspectionRate = inspectionRate;
if (availabilityHours) gig.availabilityHours = availabilityHours;

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

  if (gig.statusMode === "auto") {
    const isOnline = checkIfWithinAvailability(gig.availabilityHours);
    gig.availabilityStatus = isOnline ? "online" : "offline";
  }

  await gig.save();

  return res.status(200).json(new ApiResponse(200, gig, "Gig updated"));
});
