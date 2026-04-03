import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
    transactionId: String,
    accountId: String,
    amount: {
        type: Number,
    },
    isoCurrencyCode: {
        type: String,
    },
    date: Date,
    name: String,
    merchantName: String
})

export default mongoose.model("Transaction", transactionSchema);