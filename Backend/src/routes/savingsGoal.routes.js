import { authenticate } from "../auth/jwt";
import express from "express";
import savingsGoalController from "../controllers/savingsGoal.controller.js";

const router = express.Router();

router.get("/", authenticate, savingsGoalController.getSavingsGoals);
router.get("/:id", authenticate, savingsGoalController.getSavingsGoalById);
router.post("/", authenticate, savingsGoalController.createSavingsGoal);
router.put("/:id", authenticate, savingsGoalController.updateSavingsGoal);
router.delete("/:id", authenticate, savingsGoalController.deleteSavingsGoal);

export default router;
