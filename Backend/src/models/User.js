import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
    name: String,
    institutionId: String,
    accessToken: String
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique:true,
        sparse: true
    },
    password: {
        type: String,
    },
    name: {
        type: String,
    },
    googleId: {
        type: String,
    },
    banks: [bankSchema]
})

export default mongoose.model("Users", userSchema);