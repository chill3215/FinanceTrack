import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Banks",
        required: true
    },

    accountId: {
        type: String,
        required: true,
    },

    name: String,

    balance: {
        current: Number,
        isoCurrencyCode: String,
    }
});
accountSchema.index(
    { accountId: 1, bank: 1 },
    { unique: true }
);
export default mongoose.model("Account", accountSchema);