import { Router } from "express";
import { getAllLoans, getAllRepayments } from "../controllers/record.controller.js";



const router = Router();


router.get("/loans", getAllLoans);


router.get("/repayments", getAllRepayments);


export default router;