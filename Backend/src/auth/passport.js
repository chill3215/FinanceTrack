import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import User from "../models/User";

passport.use(
    new GoogleStrategy({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: process.env.GOOGLE_CLIENT_CALLBACK
        },
        async (_, __, profile, done) => {
            let user = await User.findOne({googleId: profile.id});

            if (!user) {
                user = await User.create({googleId: profile.id});
            }

            done(null, user);
        })
);