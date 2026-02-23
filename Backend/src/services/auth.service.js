import bcrypt from "bcrypt";
import User from "../models/User";
import {signToken} from "../auth/jwt";

const register = async (email, password) => {
    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        email,
        password: encryptedPassword
    });

    return signToken(user._id);
}

const login = async (email, password)=>{
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
        throw new Error("Invalid credentials");
    }
    const passwordValid = await bcrypt.compare(password, existingUser.password);
    if (!passwordValid) {
        throw new Error("Invalid credentials");
    }

    return signToken(existingUser._id);
}

const google = async () =>{

}

const googleCallback = async () =>{

}

export default {
    register,
    login,
    google,
    googleCallback
}