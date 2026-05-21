import {Router} from 'express';
import {checkAuth, loginUser, logoutUser, registerUserWithEmail, updateUserRole, saveFCMToken } from '../controllers/auth/auth.controller.js';
import { getGoogleLoginCallback,getGoogleLoginPage } from '../controllers/auth/google.controller.js';
import {verifyJWT}  from '../middlewares/auth.middleware.js';
import { verifyEmailOTP,sendEmailOTP } from '../controllers/auth/email_verification.controller.js';
import { postForgotPassword, resetPassword } from '../controllers/auth/password.controller.js';

const router=Router();

// registeration routes
router.route('/register').post(registerUserWithEmail);
router.route('/google').get(getGoogleLoginPage);
router.route('/google/callback').get(getGoogleLoginCallback);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT,logoutUser);
router.post("/notifications/save-token", verifyJWT, saveFCMToken);

// email verification routes
router.route("/send-email-otp").post(sendEmailOTP);
router.route("/verify-email").post(verifyEmailOTP);

// reset password routes
router.route('/reset-password').post(postForgotPassword);
router.route('/reset-password/:token').post(resetPassword);

// choose-role
router.route('/choose-role').put(verifyJWT,updateUserRole);

// check auth
router.route("/check-auth").get(verifyJWT, checkAuth);

export default router;
