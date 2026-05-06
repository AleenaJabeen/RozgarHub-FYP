import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";
import { User } from "../../models/user.model.js";

import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendOtp = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { phone } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const formattedPhone = phone.startsWith("03")
    ? "+92" + phone.slice(1)
    : phone;

  const verification = await client.verify.v2
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      to: formattedPhone,
      channel: "sms",
    });

  user.phone = formattedPhone;
  await user.save();

  res.json(new ApiResponse(200, verification, "OTP sent successfully"));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { phone, otp } = req.body;
  console.log(phone);
  if (!phone || !otp) {
    throw new ApiError(400, "Phone and OTP are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const formattedPhone = phone.startsWith("03")
    ? "+92" + phone.slice(1)
    : phone;

  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({
      to: formattedPhone,
      code: otp,
    });

  // console.log(verificationCheck.status);
  if (verificationCheck.status !== "approved") {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isPhoneVerified = true;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Phone verified successfully"));
});

const createServiceProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    name,
    cnicNo,
    bio,
    education,
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

  const requiredFields = [
    cnicNo,
    bio,
    phone,
    city,
    country,
    longitude,
    latitude,
    name,
  ];
  if (requiredFields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All mandatory fields must be filled");
  }
  const existingProfile = await ServiceProvider.findOne({ user: userId });

  if (existingProfile) {
    throw new ApiError(400, "Service provider profile already exists");
  }

  if (!req.files?.cnicImg?.[0]) {
    throw new ApiError(400, "CNIC image is required");
  }

  const uploadedCnic = await uploadOnCloudinary(req.files.cnicImg[0].path, {
    folder: "providers/cnic",
  });
  if (!uploadedCnic?.secure_url) {
    throw new ApiError(500, "Failed to upload CNIC image to Cloudinary");
  }

  let avatarUrl;
  if (req.files?.avatar?.[0]) {
    const uploadedAvatar = await uploadOnCloudinary(req.files.avatar[0].path, {
      folder: "providers/avatar",
    });
    avatarUrl = uploadedAvatar?.secure_url;
  }

  let parsedSkills = skills;
  if (typeof skills === "string") {
    parsedSkills = skills.split(",");
  }

  let certificates = [];
  if (req.files?.certificates) {
    for (const file of req.files.certificates) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "providers/certificates",
      });
      if (uploaded?.secure_url) certificates.push(uploaded.secure_url);
    }
  }

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

  const providerData = {
    user: userId,
    cnicNo,
    cnicImg: uploadedCnic.secure_url,
    bio,
    education,
    experienceDetails,
    skills: Array.isArray(parsedSkills) ? parsedSkills : [],
    urgentHire,
    certificates,
    experienceDocuments,
  };

  // ✅ Add location on creation if activating Urgent Hire
  if ((urgentHire === "true" || urgentHire === true) && longitude && latitude) {
    providerData.location = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)]
    };
  }

  const provider = await ServiceProvider.create(providerData);

  const userUpdate = {
    name,
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

  res
    .status(201)
    .json(
      new ApiResponse(
        200,
        provider,
        "Service provider profile created successfully",
      ),
    );
});

const updateServiceProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    cnicNo,
    bio,
    education,
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

  const providerProfile = await ServiceProvider.findOne({ user: userId });
  if (!providerProfile) {
    throw new ApiError(404, "Service provider profile not found");
  }

  let cnicImgUrl = providerProfile.cnicImg;
  if (req.files?.cnicImg?.[0]) {
    const uploadedCnic = await uploadOnCloudinary(req.files.cnicImg[0].path, {
      folder: "providers/cnic",
    });
    cnicImgUrl = uploadedCnic.secure_url;
  }

  let avatarUrl;
  if (req.files?.avatar?.[0]) {
    try {
      // console.log("Uploading avatar:", req.files.avatar[0]);

      const uploadedAvatar = await uploadOnCloudinary(
        req.files.avatar[0].path,
        { folder: "providers/avatar" },
      );

      if (!uploadedAvatar || !uploadedAvatar.secure_url) {
        throw new Error("Avatar upload failed");
      }

      avatarUrl = uploadedAvatar.secure_url;
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw new ApiError(500, "Error uploading avatar");
    }
  }

  let parsedSkills = providerProfile.skills;
  if (skills) {
    parsedSkills = typeof skills === "string" ? skills.split(",") : skills;
  }

  let updatedCertificates = [...providerProfile.certificates];
  if (req.files?.certificates) {
    for (const file of req.files.certificates) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "providers/certificates",
      });
      if (uploaded?.secure_url) updatedCertificates.push(uploaded.secure_url);
    }
  }

  let updatedExpDocs = [...providerProfile.experienceDocuments];
  if (req.files?.experienceDocuments) {
    for (const file of req.files.experienceDocuments) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "providers/experience",
      });
      if (uploaded?.secure_url) {
        updatedExpDocs.push({
          title: file.originalname,
          documentUrl: uploaded.secure_url,
        });
      }
    }
  }

  // ✅ Build update object for Provider Profile
  const providerUpdateObj = {
    cnicNo: cnicNo || providerProfile.cnicNo,
    cnicImg: cnicImgUrl,
    bio: bio || providerProfile.bio,
    experienceDetails: experienceDetails || providerProfile.experienceDetails,
    skills: parsedSkills,
    urgentHire: urgentHire !== undefined ? urgentHire : providerProfile.urgentHire,
    certificates: updatedCertificates,
    experienceDocuments: updatedExpDocs,
  };

  // ✅ Inject coordinates into the Provider model if Urgent Hire is activated
  if ((urgentHire === "true" || urgentHire === true) && longitude && latitude) {
    providerUpdateObj.location = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)]
    };
  }

  const updatedProvider = await ServiceProvider.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        cnicNo: cnicNo || providerProfile.cnicNo,
        cnicImg: cnicImgUrl,
        bio: bio || providerProfile.bio,
        education: education || providerProfile.education,
        experienceDetails:
          experienceDetails || providerProfile.experienceDetails,
        skills: parsedSkills,
        urgentHire:
          urgentHire !== undefined ? urgentHire : providerProfile.urgentHire,
        certificates: updatedCertificates,
        experienceDocuments: updatedExpDocs,
      },
    },
    { returnDocument: "after", runValidators: true },
  );

  const userUpdate = {};
  if (name) userUpdate.name = name;
  if (phone) userUpdate.phone = phone;
  if (avatarUrl) userUpdate.avatar = avatarUrl;

  // Update Address fields if any are provided
  if (street || city || state || country || zipCode) {
    if (street) userUpdate["location.address.street"] = street;
    if (city) userUpdate["location.address.city"] = city;
    if (state) userUpdate["location.address.state"] = state;
    if (country) userUpdate["location.address.country"] = country;
    if (zipCode) userUpdate["location.address.zipCode"] = zipCode;
  }

  if (longitude && latitude) {
    userUpdate["location.currentLocation"] = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };
  }

  await User.findByIdAndUpdate(
    userId,
    { $set: userUpdate },
    { returnDocument: "after", runValidators: true },
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedProvider, "Profile updated successfully"),
    );
});

const getServiceProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const provider = await ServiceProvider.findOne({ user: userId }).populate(
    "user",
    "name email avatar location",
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
});

export {
  createServiceProviderProfile,
  updateServiceProviderProfile,
  getServiceProviderProfile,
};
