import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { ServiceProvider } from "../../models/serviceProvider.model.js";
import {User} from '../../models/user.model.js';




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
      channel: "sms"
    });

  user.phone = formattedPhone;
  await user.save();

  res.json(new ApiResponse(200, verification, "OTP sent successfully"));

});

export const verifyOtp = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { phone, otp } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const formattedPhone = phone.startsWith("03")
    ? "+92" + phone.slice(1)
    : phone;
    console.log("Service ID:", process.env.TWILIO_SERVICE_ID);

  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({
      to: formattedPhone,
      code: otp
    });

    console.log(verificationCheck.status);
  if (verificationCheck.status !== "approved") {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isPhoneVerified = true;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, "Phone verified successfully")
  );

});




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
  console.log(req.body)
   console.log("FILES:", req.files);
    console.log("BODY:", req.body);
    console.log("USER:", req.user);
  

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
  console.log("STEP 4 - cnic upload result:", uploadedCnic);

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
  const {
    name,
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

  // 1. Check if profile exists
  const providerProfile = await ServiceProvider.findOne({ user: userId });
  if (!providerProfile) {
    throw new ApiError(404, "Service provider profile not found");
  }

  // 2. Handle CNIC Image Update (if provided)
  let cnicImgUrl = providerProfile.cnicImg;
  if (req.files?.cnicImg?.[0]) {
    const uploadedCnic = await uploadOnCloudinary(req.files.cnicImg[0].path, {
      folder: "providers/cnic",
    });
    cnicImgUrl = uploadedCnic.secure_url;
    // Optional: Add logic here to delete the old image from Cloudinary
  }

  // 3. Handle Avatar Update (if provided)
  let avatarUrl;
  if (req.files?.avatar?.[0]) {
    const uploadedAvatar = await uploadOnCloudinary(req.files.avatar[0].path, {
      folder: "providers/avatar",
    });
    avatarUrl = uploadedAvatar?.secure_url;
  }

  // 4. Parsing Skills (if provided)
  let parsedSkills = providerProfile.skills;
  if (skills) {
    parsedSkills = typeof skills === "string" ? skills.split(",") : skills;
  }

  // 5. Handle New Certificates (Appending to existing)
  let updatedCertificates = [...providerProfile.certificates];
  if (req.files?.certificates) {
    for (const file of req.files.certificates) {
      const uploaded = await uploadOnCloudinary(file.path, {
        folder: "providers/certificates",
      });
      if (uploaded?.secure_url) {
        updatedCertificates.push(uploaded.secure_url);
      }
    }
  }

  // 6. Handle New Experience Documents (Appending to existing)
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

  // 7. Update ServiceProvider Model
  const updatedProvider = await ServiceProvider.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        cnicNo: cnicNo || providerProfile.cnicNo,
        cnicImg: cnicImgUrl,
        bio: bio || providerProfile.bio,
        experienceDetails: experienceDetails || providerProfile.experienceDetails,
        skills: parsedSkills,
        urgentHire: urgentHire !== undefined ? urgentHire : providerProfile.urgentHire,
        certificates: updatedCertificates,
        experienceDocuments: updatedExpDocs,
      },
    },
    { returnDocument: 'after',
       runValidators: true
     }
  );

  // 8. Update User Model (Basic info & Location)
  const userUpdate = {};
  if(name) userUpdate.name=name;
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

  // Update Geo-coordinates
  if (longitude && latitude) {
    userUpdate["location.currentLocation"] = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };
  }

  await User.findByIdAndUpdate(userId, { $set: userUpdate }, { returnDocument: 'after', runValidators: true});

  res.status(200).json(
    new ApiResponse(200, updatedProvider, "Profile updated successfully")
  );
});


const getServiceProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find provider and populate all necessary user fields for the UI
  const provider = await ServiceProvider.findOne({ user: userId }).populate(
    "user",
    "name email avatar location"
  );

  if (!provider) {
    throw new ApiError(404, "Service Provider profile not found");
  }

  res.status(200).json(
    new ApiResponse(200, provider, "Service provider profile fetched successfully")
  );
});

export { createServiceProviderProfile, updateServiceProviderProfile ,getServiceProviderProfile};
