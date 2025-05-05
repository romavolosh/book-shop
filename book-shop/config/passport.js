const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/google/callback',
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Перевіряємо, чи існує користувач з таким Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Якщо користувача немає, перевіряємо, чи є користувач з таким email
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Оновлюємо існуючого користувача
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                }

                // Створюємо нового користувача
                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value
                });

                done(null, newUser);
            } catch (error) {
                done(error, null);
            }
        }
    )
);