import express from 'express';
import {signToken} from "../auth/jwt";
import passport from "passport";
import authController from "../controllers/auth.controller";

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/google',
    passport.authenticate('google', {scope: ['profile']})
);

router.get('/google/callback',
    passport.authenticate('google', {session: false}),
    (req, res) => {
        const token = signToken(req.user._id);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);


export default router;

