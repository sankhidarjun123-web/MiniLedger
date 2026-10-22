import { Router } from "express";
import { addLoan } from "../controllers/loans.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/add", upload.single("receipt"), addLoan);

export default router;