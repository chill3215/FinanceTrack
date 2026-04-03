import express from "express";
import plaidController from "../controllers/plaid.controller";
import {authenticate} from "../auth/jwt";
const router = express.Router();

router.post("/create_link_token", authenticate, plaidController.createLinkToken);

router.post("/handle_bank_connection", authenticate, plaidController.handleBankConnection);

export default router;