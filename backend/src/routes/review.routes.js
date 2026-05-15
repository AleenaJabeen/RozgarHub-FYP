import { Router } from "express"; 
import express from "express";
import { createReview, getGigReviews,getProviderReviews } from "../controllers/customer/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; 
const router = express.Router();

// Public route to view reviews on a Gig card/page
router.route("/gig/:gigId").get(getGigReviews);

// Protected route to submit a review (Requires Login)
router.route("/").post(verifyJWT, createReview);

// Public route to view ALL reviews for a specific Service Provider
router.route("/provider/:providerId").get(getProviderReviews);

export default router;