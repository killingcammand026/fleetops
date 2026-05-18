import express from 'express';
import { registerController, loginController, sendOtp, verifyOtp, resetPassword } from '../controllers/Auth.controller.js';
import { googleAuthController } from "../controllers/Auth.controller.js";
import {
  sendSignupOtp,
  verifySignupOtp,
} from "../controllers/Auth.controller.js";

const router = express.Router();

console.log('Auth.routes.js loaded and router created');

//register route
router.post('/register',registerController);

//login route
router.post('/login',loginController);

//google auth route
router.post("/google", googleAuthController);

router.post("/send-otp",sendOtp);
router.post("/verify-otp",verifyOtp);
router.post("/reset-password",resetPassword);


 router.post("/send-signup-otp", sendSignupOtp);

router.post("/verify-signup-otp", verifySignupOtp);

// health check for auth routes
router.get('/ping', (req, res) => res.status(200).json({message: 'auth route ping'}));

export default router;