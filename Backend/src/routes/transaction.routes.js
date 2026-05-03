import express from "express";
import { authenticate } from "../auth/jwt";
import transactionController from "../controllers/transaction.controller";

const router = express.Router();

router.get("/all", authenticate, transactionController.getAllTransactionsFromUser);

export default router;
