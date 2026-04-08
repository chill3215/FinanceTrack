import mongoose from "mongoose";

const balanceHistorySchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
});
balanceHistorySchema.index({ account: 1, date: 1 }, { unique: true });

export default mongoose.model("BalanceHistory", balanceHistorySchema);