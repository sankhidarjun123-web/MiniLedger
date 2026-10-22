import { Router } from "express";
import { registerUser, verifyOTP } from "../controllers/auth.controller.js";

const router = Router();


router.post("/user", registerUser);

router.post("/verifyOTP", verifyOTP);


export default router;