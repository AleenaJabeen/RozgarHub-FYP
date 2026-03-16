import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createServiceProviderProfile,
  getServiceProviderProfile,
  sendOtp,
  updateServiceProviderProfile,
  verifyOtp,
} from "../controllers/serviceprovider/profile.controller.js";
import { requireServiceProvider } from "../middlewares/role.middleware.js";

const router = Router();
router.route("/create-profile").post(
  verifyJWT,

  upload.fields([
    { name: "cnicImg", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
    { name: "experienceDocuments", maxCount: 5 },
  ]),
  createServiceProviderProfile,
);

router.route("/update-profile").patch(
  verifyJWT,
  upload.fields([
    { name: "cnicImg", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
    { name: "experienceDocuments", maxCount: 5 },
  ]),
  updateServiceProviderProfile,
);

router.route("/send-otp").post(verifyJWT, sendOtp);

router.route("/verify-phone-otp").post(verifyJWT, verifyOtp);

router.route("/get-profile").get(verifyJWT, getServiceProviderProfile);

export default router;
