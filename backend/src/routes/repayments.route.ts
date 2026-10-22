import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { addRepayment, updateRepayment, deleteRepayment } from "../controllers/repayments.controller.js";

const router = Router();


router.post(
  "/add",
  upload.single("image"),
  addRepayment
);

router.put(
  "/change/:repaymentId",
  upload.single("image"),
  updateRepayment
);

router.delete(
  "/remove/:repaymentId",
  deleteRepayment
);

export default router;