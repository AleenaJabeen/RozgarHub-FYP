import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { requireCustomer } from "../middlewares/role.middleware.js";
import {
  createCustomerProfile,
  updateCustomerProfile,
  getCustomerProfile,
  addSavedAddress,
  removeSavedAddress,
} from "../controllers/customer/customer.controller.js";
import { sendOtp, verifyOtp } from "../controllers/serviceprovider/profile.controller.js";

const router = Router();

router.route("/create-profile").post(
  verifyJWT,
  upload.single("avatar"),
  createCustomerProfile,
);

router.route("/update-profile").patch(
  verifyJWT,
  upload.single("avatar"),
  updateCustomerProfile,
);

router.route("/get-profile").get(verifyJWT, getCustomerProfile);

router.route("/send-otp").post(verifyJWT,  sendOtp);

router.route("/verify-phone-otp").post(verifyJWT, verifyOtp);

router.route("/add-address").patch(verifyJWT, addSavedAddress);

router.route("/remove-address").patch(verifyJWT, removeSavedAddress);

export default router;
