import express from 'express';
import { registerController, loginController, sendOtp, verifyOtp, resetPassword } from '../controllers/Auth.controller.js';
import { googleAuthController } from "../controllers/Auth.controller.js";


const router = express.Router();

//register route
router.post('/register',registerController);

//login route
router.post('/login',loginController);

//google auth route
router.post("/google", googleAuthController);

router.post("/send-otp",sendOtp);
router.post("/verify-otp",verifyOtp);
router.post("/reset-password",resetPassword);

export default router;