import express from "express";
import plaidController from "../controllers/plaidController";
import {authenticate} from "../auth/jwt";
const router = express.Router();

router.post("/create_link_token", authenticate, plaidController.createLinkToken);

router.post("/exchange_public_token", authenticate, plaidController.exchangePublicToken);

export default router;