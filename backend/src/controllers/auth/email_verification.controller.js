import crypto from "crypto";
import { User } from "../../models/user.model.js";
import { Resend } from "resend";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { OTP_EXPIRY } from "../../constants.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP
const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

const sendEmailOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.emailOTP.attempts >= 3) {
    throw new ApiError(
      400,
      "Maximum resend attempts reached Try again tomorrow",
    );
  }

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);

  user.emailOTP.hash = hashedOTP;
  user.emailOTP.expiry = Date.now() + OTP_EXPIRY; // 10 minutes
  user.emailOTP.attempts += 1;

  await user.save();

  // Send Email
  await resend.emails.send({
    from: "RozgarHub <onboarding@resend.dev>",
    to: email,
    subject: "Verify Your Email for RozgarHub",
    html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes</p>
      `,
  });
  res.status(200).json(new ApiResponse(200, email, "OTP sent succesfully"));
});

const verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user.emailOTP.hash) {
    throw new ApiError(400,"Invalid request");

  }

  // Check expiry
  if (user.emailOTP.expiry < Date.now()) {
    throw new ApiError(400,"OTP expired")
  }

  const hashedOTP = hashOTP(otp);

  if (hashedOTP !== user.emailOTP.hash) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.isEmailVerified = true;

  // Clear OTP data
  user.emailOTP.hash = undefined;
  user.emailOTP.expiry = undefined;
  user.emailOTP.attempts = 0;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully"));
};

export { verifyEmailOTP, sendEmailOTP };
