import { User } from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { generateCodeVerifier, generateState, decodeIdToken } from "arctic";
import { OAUTH_EXCHANGE_EXPIRY } from "../../constants.js";
import { generateAccessTokenandRefreshToken } from "./auth.controller.js";
import { google } from "../../lib/oauth/google.js";

// -----------------------------login wih google---------------------

const getGoogleLoginPage = asyncHandler(async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  const cookieConfig = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: OAUTH_EXCHANGE_EXPIRY,
  };

  // Clear any stale cookies
  res.clearCookie("google_oauth_state");
  res.clearCookie("google_code_verifier");

  // Set fresh OAuth cookies
  res.cookie("google_oauth_state", state, cookieConfig);
  res.cookie("google_code_verifier", codeVerifier, cookieConfig);

  return res.redirect(url.toString());
});
// -----------get GoogleLoginCallback (after login get the credentials from google and store in database )----------

const getGoogleLoginCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  const {
    google_oauth_state: storedState,
    google_code_verifier: codeVerifier,
  } = req.cookies;

  // 1️⃣ CSRF + PKCE validation
  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    state !== storedState
  ) {
    throw new ApiError(400, "Invalid Google login attempt");
  }

  // 2️⃣ Exchange authorization code for tokens
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);

  if (!tokens) {
    throw new ApiError(400, "Google authentication failed");
  }

  // 3️⃣ Decode ID token
  const claims = decodeIdToken(tokens.idToken());
  const { sub: googleUserId, name, email } = claims;

  if (!email) {
    throw new ApiError(400, "Google account does not have an email");
  }

  let user;

  // ✅ CONDITION 1: User exists with Google already linked
  user = await User.findOne({ googleId: googleUserId });

  if (!user) {
    // ✅ CONDITION 2: User exists with same email but Google not linked
    user = await User.findOne({ email });

    if (user) {
      if (user.authProvider !== "email") {
        throw new ApiError(400, "Account already exists with another provider");
      }

      // Link Google account
      user.googleId = googleUserId;
      user.authProvider = "google";
      user.isEmailVerified = true;
      await user.save();
    } else {
      // ✅ CONDITION 3: New user
      user = await User.create({
        name,
        email,
        googleId: googleUserId,
        authProvider: "google",
        isEmailVerified: true,
      });
    }
  }

  // 4️⃣ Generate JWT tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  // 5️⃣ Clear OAuth cookies
  res.clearCookie("google_oauth_state");
  res.clearCookie("google_code_verifier");

  // 6️⃣ Send tokens securely
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
     maxAge: 604800000
  };

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions);

  if (user.role==="pending") {
    return res.redirect(`${process.env.CORS_ORIGIN}/choose-role`);
  }

  return res.redirect(
    user.role === "customer"
      ? `${process.env.CORS_ORIGIN}/customer`
      : `${process.env.CORS_ORIGIN}/serviceprovider`,
  );
});

export { getGoogleLoginPage, getGoogleLoginCallback };
