import {authenticate} from "../auth/jwt";
import express from "express";
import accountController from "../controllers/account.controller";
import account from "../models/Account";

const router = express.Router();

router.get("/all_accounts/:bankId", authenticate, accountController.getAllAccounts);

router.get("/account/history/:bankId", authenticate, accountController.getAccountBalanceHistory)

export default router;