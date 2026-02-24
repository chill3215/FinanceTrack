import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: String,
    institutionId: String,
    accessToken: String,
    itemId: String,
});
export default mongoose.model("Bank", bankSchema)