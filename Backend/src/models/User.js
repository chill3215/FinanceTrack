import mongoose from "mongoose";


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
    }
})

export default mongoose.model("User", userSchema);