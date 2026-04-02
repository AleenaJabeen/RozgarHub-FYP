import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Customer } from "../../models/customer.model.js";
import { User } from "../../models/user.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const createCustomerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    phone,
    street,
    city,
    state,
    country,
    zipCode,
    longitude,
    latitude,
  } = req.body;

  const existingProfile = await Customer.findOne({ user: userId });
  if (existingProfile) {
    throw new ApiError(409, "A customer profile already exists for this account.");
  }

  let avatarUrl;
  if (req.file?.path) {
    const uploadedAvatar = await uploadOnCloudinary(req.file.path, {
      folder: "customers/avatar",
    });

    if (!uploadedAvatar?.secure_url) {
      throw new ApiError(500, "Avatar upload failed. Please try again.");
    }

    avatarUrl = uploadedAvatar.secure_url;
  }

  const userUpdate = {
    phone,
    "location.address.street": street,
    "location.address.city": city,
    "location.address.state": state,
    "location.address.country": country,
    "location.address.zipCode": zipCode,
  };

  if (avatarUrl) {
    userUpdate.avatar = avatarUrl;
  }

  if (longitude && latitude) {
    userUpdate["location.currentLocation"] = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };
  }

  await User.findByIdAndUpdate(userId, { $set: userUpdate }, { new: true });

  const customerProfile = await Customer.create({ user: userId });

  res.status(201).json(
    new ApiResponse(201, customerProfile, "Customer profile created successfully.")
  );
});

const updateCustomerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    name,
    phone,
    street,
    city,
    state,
    country,
    zipCode,
    longitude,
    latitude,
  } = req.body;

  const customerProfile = await Customer.findOne({ user: userId });
  if (!customerProfile) {
    throw new ApiError(404, "Customer profile not found.");
  }

  let avatarUrl;
  if (req.file?.path) {
    const uploadedAvatar = await uploadOnCloudinary(req.file.path, {
      folder: "customers/avatar",
    });

    if (!uploadedAvatar?.secure_url) {
      throw new ApiError(500, "Avatar upload failed. Please try again.");
    }

    avatarUrl = uploadedAvatar.secure_url;
  }

  const userUpdate = {};

  if (name)      userUpdate.name    = name;
  if (phone)     userUpdate.phone   = phone;
  if (avatarUrl) userUpdate.avatar  = avatarUrl;

  if (street)   userUpdate["location.address.street"]  = street;
  if (city)     userUpdate["location.address.city"]    = city;
  if (state)    userUpdate["location.address.state"]   = state;
  if (country)  userUpdate["location.address.country"] = country;
  if (zipCode)  userUpdate["location.address.zipCode"] = zipCode;

  if (longitude && latitude) {
    userUpdate["location.currentLocation"] = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: userUpdate },
    { returnDocument: "after", runValidators: true }
  );

  let parsedAddresses = [];
  if (req.body.savedAddresses) {
    try {
      parsedAddresses = JSON.parse(req.body.savedAddresses);
    } catch (error) {
      throw new ApiError(400, "Invalid format for saved addresses.");
    }
    
    // Update the Customer document with the parsed addresses
    await Customer.findOneAndUpdate(
      { user: userId },
      { $set: { savedAddresses: parsedAddresses } },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json(
    new ApiResponse(200, updatedUser, "Customer profile updated successfully.")
  );
});

const getCustomerProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // FIX: Explicitly added isPhoneVerified to the populate list
  const customerProfile = await Customer.findOne({ user: userId }).populate(
    "user",
    "name email phone avatar location isPhoneVerified" 
  );

  if (!customerProfile) {
    throw new ApiError(404, "Customer profile not found.");
  }

  res.status(200).json(
    new ApiResponse(200, customerProfile, "Customer profile fetched successfully.")
  );
});

const addSavedAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;

  if (!address?.trim()) {
    throw new ApiError(400, "Address is required.");
  }

  const updatedProfile = await Customer.findOneAndUpdate(
    { user: userId },
    { $addToSet: { savedAddresses: address.trim() } },
    { new: true, runValidators: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Customer profile not found.");
  }

  res.status(200).json(
    new ApiResponse(200, updatedProfile, "Address saved successfully.")
  );
});

const removeSavedAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;

  if (!address?.trim()) {
    throw new ApiError(400, "Address is required.");
  }

  const updatedProfile = await Customer.findOneAndUpdate(
    { user: userId },
    { $pull: { savedAddresses: address.trim() } },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Customer profile not found.");
  }

  res.status(200).json(
    new ApiResponse(200, updatedProfile, "Address removed successfully.")
  );
});

export { createCustomerProfile, updateCustomerProfile, getCustomerProfile, addSavedAddress, removeSavedAddress };