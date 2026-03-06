import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";


import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const createServiceProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    cnicNo,
    bio,
    experienceDetails,
    skills,
    urgentHire,
    phone,
    street,
    city,
    state,
    country,
    zipCode,
    longitude,
    latitude,
  } = req.body;

  const existingProfile = await ServiceProvider.findOne({ user: userId });

  if (existingProfile) {
    throw new ApiError(400, "Service provider profile already exists");
  }

  // CNIC IMAGE
  if (!req.files?.cnicImg?.[0]) {
    throw new ApiError(400, "CNIC image is required");
  }

  const uploadedCnic = await uploadOnCloudinary(req.files.cnicImg[0].path, {
    folder: "providers/cnic",
  });

  // AVATAR (optional)
  let avatarUrl;
  if (req.files?.avatar?.[0]) {
    const uploadedAvatar = await uploadOnCloudinary(req.files.avatar[0].path, {
      folder: "providers/avatar",
    });

    avatarUrl = uploadedAvatar?.secure_url;
  }

  // SKILLS parsing
  let parsedSkills = skills;
  if (typeof skills === "string") {
    parsedSkills = skills.split(",");
  }

  // CERTIFICATES
  let certificates = [];

  if (req.files?.certificates) {
    for (const file of req.files.certificates) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "providers/certificates",
      });

      if (uploaded?.secure_url) {
        certificates.push(uploaded.secure_url);
      }
    }
  }

  // EXPERIENCE DOCUMENTS
  let experienceDocuments = [];

  if (req.files?.experienceDocuments) {
    for (const file of req.files.experienceDocuments) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "providers/experience",
      });

      if (uploaded?.secure_url) {
        experienceDocuments.push({
          title: file.originalname,
          documentUrl: uploaded.secure_url,
        });
      }
    }
  }

  // CREATE SERVICE PROVIDER PROFILE
  const provider = await ServiceProvider.create({
    user: userId,
    cnicNo,
    cnicImg: uploadedCnic.secure_url,
    bio,
    experienceDetails,
    skills: parsedSkills,
    urgentHire,
    certificates,
    experienceDocuments,
  });

  // UPDATE USER PROFILE DATA
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

  await User.findByIdAndUpdate(userId, userUpdate, { new: true });

  res.status(201).json(
    new ApiResponse(200, provider, "Service provider profile created successfully")
  );
});
const updateServiceProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const provider = await ServiceProvider.findOne({ user: userId });

  if (!provider) {
    throw new ApiError(404, "Service Provider profile not found");
  }

  const updateData = { ...req.body };

  // Upload new certificates
  if (req.files?.certificates) {
    let newCertificates = [];

    for (const file of req.files.certificates) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "providers/certificates",
      });

      if (uploaded?.secure_url) {
        newCertificates.push(uploaded.secure_url);
      }
    }

    updateData.$push = { certificates: { $each: newCertificates } };
  }

  const updatedProvider = await ServiceProvider.findOneAndUpdate(
    { user: userId },
    updateData,
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedProvider, "Profile updated successfully")
    );
});


export const getServiceProviderProfile = async (req, res) => {
  const userId = req.user.id;

  const provider = await ServiceProvider.findOne({ user: userId }).populate(
    "user",
    "name email",
  );

  if (!provider) {
    throw new ApiError(404, "Service Provider profile not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        provider,
        "Service provider profile fetched successfully",
      ),
    );
};

export { createServiceProviderProfile, updateServiceProviderProfile };
