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

  if (!phone || !otp) {
    throw new ApiError(400, "Phone and OTP are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Format phone to E.164 standard for Pakistan (+92...)
  const formattedPhone = phone.startsWith("03")
    ? "+92" + phone.slice(1)
    : phone;

  try {
    console.log("Attempting Twilio verification for:", formattedPhone);

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({
        to: formattedPhone,
        code: otp,
      });

    console.log("Twilio Response Status:", verificationCheck.status);

    if (verificationCheck.status !== "approved") {
      throw new ApiError(400, "Invalid or expired OTP");
    }

  } catch (err) {
    // CRITICAL: Log the actual error to your terminal so you can see what went wrong
    console.error("Twilio Error Caught:", err);

    if (err.code === 20404) {
      throw new ApiError(400, "OTP expired or already used. Please request a new one.");
    }
    
    // Fallback for other Twilio errors (e.g., invalid credentials, bad phone format)
    throw new ApiError(err.status || 500, err.message || "Twilio verification failed");
  }

  // If everything passes, update user status
  user.isPhoneVerified = true;
  await user.save();

  return res
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

  // 1. Safe Mandatory Fields Validation (Prevents .trim() crashes on Numbers)
  const requiredFields = [cnicNo, bio, phone, city, country, longitude, latitude, name];
  
  const hasEmptyFields = requiredFields.some((field) => {
    if (field === undefined || field === null) return true;
    if (typeof field === "string" && field.trim() === "") return true;
    return false;
  });

  if (hasEmptyFields) {
    throw new ApiError(400, "All mandatory fields must be filled");
  }

  // Check if profile already exists
  const existingProfile = await ServiceProvider.findOne({ user: userId });
  if (existingProfile) {
    throw new ApiError(400, "Service provider profile already exists");
  }

  // 2. Validate Files structure safely
  if (!req.files || !req.files.cnicImg || !req.files.cnicImg[0]) {
    throw new ApiError(400, "CNIC image file is required");
  }

  // Wrap Cloudinary and DB calls in a clean try/catch to debug 500 errors easily
  try {
    // Upload CNIC
    const uploadedCnic = await uploadOnCloudinary(req.files.cnicImg[0].path, {
      folder: "providers/cnic",
    });
    if (!uploadedCnic?.secure_url) {
      throw new ApiError(500, "Failed to upload CNIC image to Cloudinary");
    }

    // Upload Avatar if it exists
    let avatarUrl;
    if (req.files?.avatar?.[0]) {
      const uploadedAvatar = await uploadOnCloudinary(req.files.avatar[0].path, {
        folder: "providers/avatar",
      });
      avatarUrl = uploadedAvatar?.secure_url;
    }

    // Parse Skills safely
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills;
    } else if (typeof skills === "string" && skills.trim() !== "") {
      parsedSkills = skills.split(",").map(s => s.trim());
    }

    // Upload Certificates
    let certificates = [];
    if (req.files?.certificates) {
      for (const file of req.files.certificates) {
        const uploaded = await uploadOnCloudinary(file.path, {
          folder: "providers/certificates",
        });
        if (uploaded?.secure_url) certificates.push(uploaded.secure_url);
      }
    }

    // Upload Experience Documents
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

    // Parse coordinates safely to prevent Mongo GeoJSON errors
    const numLng = Number(longitude);
    const numLat = Number(latitude);

    if (isNaN(numLng) || isNaN(numLat)) {
      throw new ApiError(400, "Longitude and Latitude must be valid numeric values");
    }

    const providerData = {
      user: userId,
      cnicNo,
      cnicImg: uploadedCnic.secure_url,
      bio,
      education,
      experienceDetails,
      skills: parsedSkills,
      urgentHire: urgentHire === "true" || urgentHire === true,
      certificates,
      experienceDocuments,
    };

    // Add location on creation if activating Urgent Hire
    if (providerData.urgentHire) {
      providerData.location = {
        type: "Point",
        coordinates: [numLng, numLat], // Ensure they are numbers!
      };
    }

    // Create Service Provider
    const provider = await ServiceProvider.create(providerData);

    // Prepare User update payload
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

    userUpdate["location.currentLocation"] = {
      type: "Point",
      coordinates: [numLng, numLat],
    };

    // Update User Document
    await User.findByIdAndUpdate(userId, userUpdate, { new: true });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          provider,
          "Service provider profile created successfully",
        ),
      );

  } catch (error) {
    // Catch MongoDB Duplicate Key Errors (Error Code 11000)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      
      throw new ApiError(
        400, 
        `A service provider with this ${duplicateField} already exists.`
      );
    }

    console.error("CRITICAL PROFILE CREATION ERROR:", error);
    
    throw error;
  
  }
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
     education: education || providerProfile.education,
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
        ...providerUpdateObj,   
      },
    },
    { returnDocument: "after", runValidators: true },
  );

  const userUpdate = {};
  if (name) userUpdate.name = name;
  if (phone) userUpdate.phone = phone;
  if (avatarUrl) userUpdate.avatar = avatarUrl;

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
    "name email avatar location phone",
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
