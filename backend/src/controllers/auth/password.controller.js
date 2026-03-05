import crypto from "crypto";
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { User } from '../../models/user.model.js';
import { RESET_PASSWORD_TOKEN_EXPIRY } from "../../constants.js";
import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);


/**
  Generates a token, hashes it, and saves it to the DB
 */
const generateTemporaryToken = async (user) => {
    // 1. Create a raw random token
    const unhashedToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash the token to store in the DB (Security best practice)
    const tokenHash = crypto
        .createHash('sha256')
        .update(unhashedToken)
        .digest('hex');

    // 3. Set expiry (e.g., 15 minutes)
    const tokenExpiry = Date.now() + RESET_PASSWORD_TOKEN_EXPIRY;

    // 4. Save to user object
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
            .json(new ApiResponse(200, {}, "If an account exists, a reset link has been sent."));
    }

    // Generate token
    const resetToken = await generateTemporaryToken(user);

    // Construct URL (Frontend URL)
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;

    const message = `Your password reset link is: \n\n ${resetUrl} \n\n This link expires in 15 minutes.`;

    try {
     await resend.emails.send({
  from: "RozgarHub <onboarding@resend.dev>",
  to: email,
  subject: "Reset your password for RozgarHub",
  html: `
    <div style="font-family: 'Inter', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0D7A5F; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">RozgarHub</h1>
      </div>

      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <h2 style="color: #222; margin-top: 0;">Forgot your password?</h2>
        <p>We received a request to reset the password for your RozgarHub account. No changes have been made yet.</p>
        <p>Click the button below to choose a new password. <strong>This link will expire in 15 minutes.</strong></p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0D7A5F; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Reset Your Password
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          If the button above doesn't work, copy and paste this link into your browser:
          <br />
          <a href="${resetUrl}" style="color: #0D7A5F; word-break: break-all;">${resetUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
        
        <p style="font-size: 12px; color: #999;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain the same.
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>© 2026 RozgarHub Marketplace. All rights reserved.</p>
      </div>
    </div>
  `,
});

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Reset link sent to your email successfully."));
            
    } catch (error) {
        // If email fails, clear the DB fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, "Email could not be sent. Please try again later.");
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
    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // 2. Find user with valid token and check expiry
    const user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpiry: { $gt: Date.now() }
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
        .json(new ApiResponse(200, {}, "Password reset successfully. You can now login."));
});

export { 
    postForgotPassword, 
    resetPassword 
};