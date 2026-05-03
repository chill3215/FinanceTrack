import savingsGoalService from "../services/savingsGoal.service.js";

const getSavingsGoals = async (req, res) => {
  try {
    const goals = await savingsGoalService.getAllSavingsGoalsByUserId(req.userId);
    return res.json(goals);
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json("Fetch savings goals failed");
  }
};

const getSavingsGoalById = async (req, res) => {
  try {
    const goal = await savingsGoalService.getSavingsGoalById(req.userId, req.params.id);
    if (!goal) {
      return res.status(404).json("Savings goal not found");
    }
    return res.json(goal);
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json("Fetch savings goal failed");
  }
};

const createSavingsGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, notes } = req.body;
    const goal = await savingsGoalService.createSavingsGoal(req.userId, {
      name,
      targetAmount,
      currentAmount,
      targetDate,
      notes,
    });
    return res.status(201).json(goal);
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json("Create savings goal failed");
  }
};

const updateSavingsGoal = async (req, res) => {
  try {
    const goal = await savingsGoalService.updateSavingsGoal(req.userId, req.params.id, req.body);
    if (!goal) {
      return res.status(404).json("Savings goal not found");
    }
    return res.json(goal);
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json("Update savings goal failed");
  }
};

const deleteSavingsGoal = async (req, res) => {
  try {
    const deleted = await savingsGoalService.deleteSavingsGoal(req.userId, req.params.id);
    if (!deleted) {
      return res.status(404).json("Savings goal not found");
    }
    return res.json({ message: "Savings goal deleted" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json("Delete savings goal failed");
  }
};

export default {
  getSavingsGoals,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
};
