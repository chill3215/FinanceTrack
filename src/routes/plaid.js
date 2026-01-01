import express from "express";
import plaidController from "../controllers/plaidController";
const router = express.Router();

router.post("/create_link_token", plaidController.createLinkToken);

router.post("/exchange_public_token", plaidController.exchangePublicToken);

export default router;