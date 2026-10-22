import { Router } from "express";
import { getCurrentUser, registerUser, verifyOTP, deleteAccount } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();


router.get("/check-user", authenticate, getCurrentUser);

router.post("/user", registerUser);

router.post("/verifyOTP", verifyOTP);

router.delete("/delete-account", authenticate, deleteAccount);


export default router;