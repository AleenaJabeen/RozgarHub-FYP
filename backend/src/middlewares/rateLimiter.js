
import rateLimit from 'express-rate-limit'

// For login route specifically
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts per window
  skipSuccessfulRequests: true, // ✅ only count failed attempts
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,  // sends RateLimit headers in response
  legacyHeaders: false,
});

// For OTP/email sending (prevent OTP spam)
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 3,                // 3 OTP requests per minute
  message: {
    success: false,
    message: "Too many OTP requests. Please wait a minute.",
  },
});

// General API limiter (apply to all routes)
export const globalRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 100,                   // 100 requests per window
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});