import Stripe from "stripe";
import Payment from "../../models/payment.model.js";
import Order from "../../models/order.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getIO } from "../../socket/socket.js"; // ✅ Imported socket helper

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe Checkout Session
// @route   POST /api/v1/payments/create-checkout-session/:orderId
export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // 1. Find the order and verify it's ready for payment
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.");
  if (order.status !== "completed") {
    throw new ApiError(400, "You can only pay for completed orders.");
  }
  if (!order.totalAmount || order.totalAmount <= 0) {
    throw new ApiError(400, "Order total amount is invalid.");
  }

  // 2. Check if a payment already exists
  let payment = await Payment.findOne({ orderId: order._id });

  if (payment && (payment.paymentStatus === "released" || payment.paymentStatus === "escrow")) {
    throw new ApiError(400, "This order has already been paid for.");
  }

  // 3. Create a pending payment record if it doesn't exist
  if (!payment) {
    payment = await Payment.create({
      orderId: order._id,
      customerId: order.customerId,
      serviceProviderId: order.serviceProviderId,
      amount: order.totalAmount,
      paymentMethod: "Stripe",
      paymentStatus: "pending",
    });
  }

  // 4. Create the Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    metadata: {
      orderId: order._id.toString(),
      paymentId: payment._id.toString(),
    },
    line_items: [
      {
        price_data: {
          currency: "pkr", 
          product_data: {
            name: `RozgarHub Service: ${order.category || "Gig Order"}`,
            description: `Order ID: ${order._id}`,
          },
          unit_amount: Math.round(order.totalAmount * 100), 
        },
        quantity: 1,
      },
    ],
    // Redirects back to your React app after success/failure
    success_url: `${process.env.CLIENT_URL}/customer/orders/${order._id}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/customer/orders/${order._id}?payment=cancelled`,
  });

  // 5. Send the URL to the frontend
  res.status(200).json(new ApiResponse(200, { url: session.url }, "Checkout session created."));
});

// @desc    Stripe Webhook Listener
// @route   POST /api/v1/payments/webhook
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    const paymentId = session.metadata.paymentId;
    const orderId = session.metadata.orderId;

    try {
      // 1. Update the Payment record to mark funds as secured
      await Payment.findByIdAndUpdate(paymentId, {
        paymentStatus: "released", 
        transactionReference: session.payment_intent, 
      });

      // 2. Update the Order record so the frontend knows it has been paid
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true
      });

      // ✅ 3. Emit socket event for instant UI update!
      try {
        const io = getIO();
        io.emit("payment_completed", orderId);
        console.log(`📡 Socket emitted: payment_completed for Order ${orderId}`);
      } catch (socketErr) {
        console.error("Socket emission failed:", socketErr);
      }

      console.log(`✅ Payment ${paymentId} marked as released for Order ${orderId}!`);
    } catch (dbError) {
      console.error("Database update failed during webhook processing:", dbError);
    }
  }

  // Acknowledge receipt of the event to Stripe
  res.status(200).send("Webhook received");
};