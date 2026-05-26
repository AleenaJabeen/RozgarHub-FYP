import express from "express";
import { createCheckoutSession } from "../controllers/payment/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// @route   POST /api/v1/payments/create-checkout-session/:orderId
// @access  Private (Requires JWT to ensure secure payment generation)
router.route("/create-checkout-session/:orderId").post(verifyJWT, createCheckoutSession);

export default router;