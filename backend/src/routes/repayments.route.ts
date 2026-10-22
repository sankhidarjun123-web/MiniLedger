import { Router } from "express";
import { addRepayment, updateRepayment, deleteRepayment } from "../controllers/repayments.controller.js";

const router = Router();


router.post(
  "/add",
  addRepayment
);

router.put(
  "/change/:repaymentId",
  updateRepayment
);

router.delete(
  "/remove/:repaymentId",
  deleteRepayment
);

export default router;