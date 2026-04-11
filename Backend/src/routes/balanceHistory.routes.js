import express from "express";
import {authenticate} from "../auth/jwt";
import balanceHistoryController from "../controllers/balanceHistory.controller";

const router = express.Router();

router.get("/monthly", authenticate, balanceHistoryController.getMonthlyBalanceOfUser);

router.get("/weekly", authenticate, balanceHistoryController.getWeeklyBalanceOfUser);

router.get("/yearly", authenticate, balanceHistoryController.getYearlyBalanceOfUser);

export default router;