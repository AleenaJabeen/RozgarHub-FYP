import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  respondToOrder,
  startWork,
  completeOrder,
  cancelOrder,
} from "../controllers/orders/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  requireCustomer,
  requireServiceProvider,
} from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ─── Collection Routes (/api/v1/orders) ───────────────────────────────────────

// [Customer Only] Create a new order.
// Multer handles up to 5 order images uploaded under the "orderImages" field.
router
  .route("/")
  .post(
    verifyJWT,
    requireCustomer,
    upload.fields([{ name: "orderImages", maxCount: 5 }]),
    createOrder
  )

  // [Customer & Service Provider] Fetch all orders relevant to the logged-in user.
  // The controller filters results based on req.user role and ID.
  .get(verifyJWT, getOrders);

// ─── Single Order Routes (/api/v1/orders/:id) ─────────────────────────────────

// [Customer & Service Provider] Fetch full details of a single order by its ID.
router.route("/:orderId").get(verifyJWT, getOrderById);

// [Service Provider Only] Accept or reject a pending order.
router.route("/:orderId/respond").patch(verifyJWT, requireServiceProvider, respondToOrder);

// [Service Provider Only] Mark an accepted order as "in-progress" to begin work.
router.route("/:orderId/start").patch(verifyJWT, requireServiceProvider, startWork);

// [Service Provider Only] Mark an in-progress order as "completed" and submit
// final billing details (hoursWorked, totalAmount, finalDescription, etc.).
router.route("/:orderId/complete").patch(verifyJWT, requireServiceProvider, completeOrder);

// [Customer & Service Provider] Cancel an order.
// The controller is responsible for validating who is cancelling and
// whether the current order status allows cancellation.
router.route("/:orderId/cancel").patch(verifyJWT, cancelOrder);

export default router;
