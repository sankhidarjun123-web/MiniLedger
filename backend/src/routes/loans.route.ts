import { Router } from "express";
import { addLoan, updateLoan, deleteLoan } from "../controllers/loans.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/add", upload.single("receipt"), addLoan);


router.put(
  "/change/:loanId",
  upload.single("receipt"),
  updateLoan
);

router.delete("/remove/:loanId", deleteLoan);

export default router;