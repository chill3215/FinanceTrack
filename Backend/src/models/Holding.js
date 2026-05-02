import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
    accountId: String,
    costBasis: Number,
    institutionValue: Number,
    institutionPrice: Number,
    quantity: Number,
    securityId: {
        type: String,
        required: true,
    },
    tickerSymbol: String,
    name: String,
    type: String,
})

export default mongoose.model("Holding", holdingSchema)