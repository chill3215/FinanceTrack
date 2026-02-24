import authService from "../services/auth.service";

const register = async (req, res) => {
    const { email, password } = req.body;
    const token = await authService.register(email, password);
    res.json({ token })
}

const login = async (req, res) =>{
    const { email, password } = req.body;
    try{
        const token = await authService.login(email, password);
        res.json({ token });
    }
    catch (error){
        res.status(401).json({message: error.message});
    }
}

const google = async (req, res) =>{

}

const googleCallback = async (req, res) =>{

}

export default {
    register,
    login,
    google,
    googleCallback
}