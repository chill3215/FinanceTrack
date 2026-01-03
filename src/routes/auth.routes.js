import express from 'express';
import bcrypt from 'bcrypt'
import User from "../models/User";
import {signToken} from "../auth/jwt";
import passport from "passport";
const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        email,
        password: encryptedPassword
    });

    const token = signToken(user._id);

    res.json({ token })
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) return res.status(401).send('Invalid credentials');

    const passwordValid = bcrypt.compare(password, existingUser.password);
    if (!passwordValid) return res.status(401).send('Invalid credentials');

    const token = signToken(existingUser._id);

    res.json({ token });
});

router.get('/google',
    passport.authenticate('google', {scope: ['profile']})
);

router.get('/google/callback',
    passport.authenticate('google', {session: 'false'}),
    (req, res) => {
        const token = signToken(req.user._id);
        res.json({token });
    }
);


export default router;

