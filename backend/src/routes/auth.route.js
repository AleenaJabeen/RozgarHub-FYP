import {Router} from 'express';
import {loginUser, logoutUser, registerUserWithEmail } from '../controllers/auth/auth.controller.js';
import { getGoogleLoginCallback,getGoogleLoginPage } from '../controllers/auth/google.controller.js';
import {verifyJWT}  from '../middlewares/auth.middleware.js';

const router=Router();

router.route('/register').post(registerUserWithEmail);
router.route('/google').get(getGoogleLoginPage);
router.route('/google/callback').get(getGoogleLoginCallback);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT,logoutUser);

export default router;
