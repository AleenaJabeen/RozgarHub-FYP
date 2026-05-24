import { User } from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// -----------generate tokens------------
const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Server Error generating tokens");
  }
};

// ------------------------Sign up with email---------------------------------

const registerUserWithEmail = asyncHandler(async (req, res) => {
  // first take the fields from user
  const { name, email, password } = req.body;
  // validate the fields ensure they are not empty
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  // check if the user with same email already exist if true then throw error
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "Email or User already exists");
  }
  // create the user in database
  const user = await User.create({
    name: name.toLowerCase(),
    email,
    password,
    authProvider: "email",
    isEmailVerified:false
  });
  // check if the user created or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  // if user is not created throw error
  if (!createdUser) {
    throw new ApiError(500, "User not created");
  }
  // if everything works accurately send a response of success
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered succesfully"));
});

// ----------logout User-------------------
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { returnDocument: 'after' }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

// -------------------------LOGIN USER WITH EMAIL-------------------------
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });


  if (!user) {
    throw new ApiError(404, "Invalid Email or Password");
  }
  if(!user.isEmailVerified){
    throw new ApiError(401,"Email not verified.Verify your email!")
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid Email or Password");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  const options = {
    httpOnly: true,
    secure: true,
     maxAge: 604800000
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User logged in sucessfully",
      ),
    );
});

// choose role
const updateUserRole=asyncHandler(async(req,res)=>{
  const {role}=req.body;
  const userId = req.user._id;
  if(!['customer', 'serviceprovider'].includes(role)){
    throw new ApiError(400,"Invalid role selected. Please choose 'customer' or 'provider")
  };
  const updatedUser = await User.findByIdAndUpdate(
  userId,
  { role },
  { 
    returnDocument: 'after', // ✅ Replaces { new: true }
    runValidators: true 
  }
);

    if(!updatedUser){
      throw new ApiError(404,"User not found");
    }

    return res.status(200).json(
      new ApiResponse(200,updatedUser,"User role selected successfully")

    );


});

const checkAuth = asyncHandler(async (req, res) => {
  // Your existing auth middleware should populate req.user
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "User authenticated")
  );
});

const saveFCMToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(400, "FCM token is required");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: {
      fcmTokens: token,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, null, "FCM token saved")
  );
};

export { registerUserWithEmail, logoutUser, loginUser,generateAccessTokenandRefreshToken,updateUserRole ,checkAuth,saveFCMToken};