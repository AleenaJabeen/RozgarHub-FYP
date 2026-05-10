import { Router } from "express";

import {
  createGig,
  getMyGigs,
  getGigById,
  updateGig,
  deleteGig,
  setGigUnavailable,
  setGigAvailable,
  enableAutoMode,
  searchPublicGigs
} from "../controllers/serviceprovider/gig.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireServiceProvider } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/* =====================================================
   PUBLIC ROUTES
===================================================== */

// Public: View single gig
router.get("/search", searchPublicGigs);
router.get("/:id", getGigById);

/* =====================================================
   PROTECTED ROUTES (Service Providers Only)
===================================================== */

// Apply auth + role middleware to all routes below
router.use(verifyJWT, requireServiceProvider);

/* -------------------------
   Create Gig
-------------------------- */
router.post(
  "/",
  upload.array("images"), // no limit (generic)
  createGig
);

/* -------------------------
   Get My Gigs
-------------------------- */
router.get("/provider/my-gigs", getMyGigs);

/* -------------------------
   Update Gig
-------------------------- */
router.patch(
  "/:id",
  upload.array("images"), // allow adding new images
  updateGig
);

/* -------------------------
   Delete Gig
-------------------------- */
router.delete("/:id", deleteGig);

/* -------------------------
   Manual Status Controls
-------------------------- */

// Set Unavailable (Manual Mode)
router.patch("/:id/unavailable", setGigUnavailable);

// Set Available (Switch back to Auto)
router.patch("/:id/available", setGigAvailable);

// Explicit Enable Auto Mode
router.patch("/:id/mode/auto", enableAutoMode);

export default router;