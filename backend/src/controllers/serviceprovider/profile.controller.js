import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";


import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const createServiceProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { cnicNo, bio, experienceYears, skills, urgentHire } = req.body;

  const existingProfile = await ServiceProvider.findOne({ user: userId });

  if (existingProfile) {
    throw new ApiError(400, "Service provider profile already exists");
  }

  // CNIC IMAGE
  let cnicImgUrl = "";
  if (req.files?.cnicImg?.[0]) {
    const uploaded = await uploadOnCloudinary(req.files.cnicImg[0].path, {
      folder: "providers/cnic",
    });

    cnicImgUrl = uploaded.secure_url;
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

  const provider = await ServiceProvider.create({
    user: userId,
    cnicNo,
    cnicImg: cnicImgUrl,
    bio,
    experienceYears,
    skills,
    urgentHire,
    certificates,
    experienceDocuments,
  });

  if (!provider) {
    throw new ApiError(500, "Service Provider profile is not created");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        provider,
        "Service provider profile created successfully"
      )
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
