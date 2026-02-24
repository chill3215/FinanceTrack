import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bank",
        required: true
    },

    accountId: {
        type: String,
        required: true,
    },

    name: String,

    balances: {
        current: Number,
        isoCurrencyCode: String,
    },
    subtype: String,
    type: String
});
accountSchema.index(
    { accountId: 1, bank: 1 },
    { unique: true }
);
export default mongoose.model("Account", accountSchema);