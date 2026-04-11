import express from "express";
import {authenticate} from "../auth/jwt";
import balanceHistoryController from "../controllers/balanceHistory.controller";

const router = express.Router();

router.get("/monthly", authenticate, balanceHistoryController.getMonthlyBalanceOfUser);

export default router;