import crypto from "crypto";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/user.model.js";
import { RESET_PASSWORD_TOKEN_EXPIRY } from "../../constants.js";
import { sendResetPasswordLink } from "../../lib/oauth/emailJS.js";

const generateTemporaryToken = async (user) => {
  const unhashedToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

  //  Set expiry (e.g., 15 minutes)
  const tokenExpiry = Date.now() + RESET_PASSWORD_TOKEN_EXPIRY;

  //  Save to user object
  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  return unhashedToken;
};

const postForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  // For security, don't reveal if a user exists or not.
  // Just send a generic "Email sent" response.
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If an account exists, a reset link has been sent.",
        ),
      );
  }

  // Generate token
  const resetToken = await generateTemporaryToken(user);

  // Construct URL (Frontend URL)
  const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;

  try {
    // 1. Attempt to send the email
    await sendResetPasswordLink(email, resetUrl);

    // 2. If successful, return success
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Reset link sent successfully. Check your inbox.",
        ),
      );
  } catch (error) {
    console.error("Email Sending Error:", error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(
      500,
      "We encountered an issue sending your reset email. Please try again in a few minutes.",
    );
  }
});

/**
 * @route POST /api/v1/users/reset-password/:token
 * @description Actually updates the password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "New password is required");
  }

  // 1. Hash the incoming token to compare with DB
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Find user with valid token and check expiry
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or has expired");
  }

  // 3. Update password and clear reset fields
  user.password = password; // Assuming your model has a .pre('save') hook to hash this
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset successfully. You can now login.",
      ),
    );
});

export { postForgotPassword, resetPassword };
