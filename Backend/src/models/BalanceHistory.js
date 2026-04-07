import mongoose from "mongoose";

const balanceHistorySchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    date: Date,
    balance: Number,
});

export default mongoose.model("BalanceHistory", balanceHistorySchema);