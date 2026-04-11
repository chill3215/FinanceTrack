import {authenticate} from "../auth/jwt";
import express from "express";
import accountController from "../controllers/account.controller";
import account from "../models/Account";

const router = express.Router();

router.get("/all", authenticate, accountController.getAllAccountsFromUser);

router.get("/all/:bankId", authenticate, accountController.getAllAccountsOfBankFromUser);

router.get("/history/", authenticate, accountController.getAccountBalanceHistory);

router.get("/history/:accountId", authenticate, accountController.getAccountBalanceHistory);


export default router;