import { upload } from '../middlewares/multer.middleware.js';
import {Router} from 'express'
import {verifyJWT} from '../middlewares/auth.middleware.js';
import { createServiceProviderProfile, updateServiceProviderProfile } from "../controllers/serviceprovider/profile.controller.js";
import { requireServiceProvider } from '../middlewares/role.middleware.js';


const router=Router();
router.route(
  "/create-profile").post(
  verifyJWT,
  requireServiceProvider,
  upload.fields([
    { name: "cnicImg", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
    { name: "experienceDocuments", maxCount: 5 },
  ]),
  createServiceProviderProfile
);

router.route(
  "/update-profile").patch(
  verifyJWT,
  requireServiceProvider,
  upload.fields([
    { name: "cnicImg", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
    { name: "experienceDocuments", maxCount: 5 },
  ]),
  updateServiceProviderProfile
);

export default router;