import express from "express";
import { authenticate } from "../auth/jwt";
import holdingController from "../controllers/holding.controller";

const router = express.Router();

router.get("/all", authenticate, holdingController.getAllHoldingsFromUser);

router.post("/import/:bankId", authenticate, holdingController.importHoldings);

router.post("/import-all", authenticate, holdingController.importAllHoldingsForUser);

export default router;
