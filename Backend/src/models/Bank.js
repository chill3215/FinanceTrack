import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    name: String,
    institutionId: String,
    accessToken: String,
    itemId: String,
});
export default mongoose.model("Banks", bankSchema)