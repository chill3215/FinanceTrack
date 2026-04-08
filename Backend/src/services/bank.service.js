import Bank from "../models/Bank";
import mongoose from "mongoose";

const addBank = async ( bank, userId, accessToken, itemId) =>  {
    return Bank.findOneAndUpdate(
    {
        user: new mongoose.Types.ObjectId(userId),
        institutionId: bank.institution_id,
    },
    {
        user: userId,
        name: bank.name || "Unknown bank",
        institutionId: bank.institution_id,
        accessToken,
        itemId
    },
    {
            upsert: true,
            new: true
    });
}

export default {
    addBank
}