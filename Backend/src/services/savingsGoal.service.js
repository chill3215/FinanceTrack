import mongoose from "mongoose";
import SavingsGoal from "../models/SavingsGoal.js";

async function getAllSavingsGoalsByUserId(userId) {
  return SavingsGoal.find({ user: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
}

async function getSavingsGoalById(userId, goalId) {
  return SavingsGoal.findOne({
    _id: new mongoose.Types.ObjectId(goalId),
    user: new mongoose.Types.ObjectId(userId),
  }).lean();
}

async function createSavingsGoal(userId, goalData) {
  const goal = new SavingsGoal({
    user: new mongoose.Types.ObjectId(userId),
    name: goalData.name,
    targetAmount: goalData.targetAmount,
    currentAmount: goalData.currentAmount || 0,
    targetDate: goalData.targetDate,
    notes: goalData.notes || "",
  });

  return goal.save();
}

async function updateSavingsGoal(userId, goalId, updateData) {
  const updateFields = {};
  if (updateData.name !== undefined) updateFields.name = updateData.name;
  if (updateData.targetAmount !== undefined) updateFields.targetAmount = updateData.targetAmount;
  if (updateData.currentAmount !== undefined) updateFields.currentAmount = updateData.currentAmount;
  if (updateData.targetDate !== undefined) updateFields.targetDate = updateData.targetDate;
  if (updateData.notes !== undefined) updateFields.notes = updateData.notes;

  return SavingsGoal.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(goalId),
      user: new mongoose.Types.ObjectId(userId),
    },
    updateFields,
    { new: true, runValidators: true }
  ).lean();
}

async function deleteSavingsGoal(userId, goalId) {
  return SavingsGoal.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(goalId),
    user: new mongoose.Types.ObjectId(userId),
  }).lean();
}

export default {
  getAllSavingsGoalsByUserId,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
};
