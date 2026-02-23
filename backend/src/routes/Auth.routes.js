import express from 'express';
import { registerController, loginController } from '../controllers/Auth.controller.js';
import { googleAuthController } from "../controllers/Auth.controller.js";


const router = express.Router();

//register route
router.post('/register',registerController);

//login route
router.post('/login',loginController);

//google auth route
router.post("/google", googleAuthController);

export default router;