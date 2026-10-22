import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { addRepayment } from "../controllers/repayments.controller.js";

const router = Router();


router.post(
  "/add",
  upload.single("image"),
  addRepayment
);

export default router;