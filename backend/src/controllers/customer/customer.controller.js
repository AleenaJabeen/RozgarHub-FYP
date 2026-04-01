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

  // 4. Create the Customer profile document
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

  // 1. Verify the Customer profile exists
  const customerProfile = await Customer.findOne({ user: userId });
  if (!customerProfile) {
    throw new ApiError(404, "Customer profile not found.");
  }

  // 2. Upload new avatar if provided
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

  // 3. Build partial User update — only include fields that were sent
  const userUpdate = {};

  if (name)      userUpdate.name    = name;
  if (phone)     userUpdate.phone   = phone;
  if (avatarUrl) userUpdate.avatar  = avatarUrl;

  if (street)   userUpdate["location.address.street"]  = street;
  if (city)     userUpdate["location.address.city"]    = city;
  if (state)    userUpdate["location.address.state"]   = state;
  if (country)  userUpdate["location.address.country"] = country;
  if (zipCode)  userUpdate["location.address.zipCode"] = zipCode;

  // Both coordinates must arrive together to form a valid GeoJSON Point
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

  res.status(200).json(
    new ApiResponse(200, updatedUser, "Customer profile updated successfully.")
  );
});

const getCustomerProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const customerProfile = await Customer.findOne({ user: userId }).populate(
    "user",
    "name email phone avatar location"
  );

  if (!customerProfile) {
    throw new ApiError(404, "Customer profile not found.");
  }

  res.status(200).json(
    new ApiResponse(200, customerProfile, "Customer profile fetched successfully.")
  );
});


export { createCustomerProfile, updateCustomerProfile, getCustomerProfile};
