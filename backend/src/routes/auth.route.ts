import { Router } from "express";
import { getCurrentUser, registerUser, verifyOTP } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();


router.get("check-user", authenticate, getCurrentUser);

router.post("/user", registerUser);

router.post("/verifyOTP", verifyOTP);


export default router;