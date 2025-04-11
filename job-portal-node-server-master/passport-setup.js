require('dotenv').config();
var mongoose =
    require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const UserModel = require('./models/user/user.model.server');
var userSchema =
    require('./models/user/user.schema.server');
var UserModel = mongoose
    .model('UserModel', userSchema);
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserModel.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err, null));
});

passport.use(new GoogleStrategy({
    clientID: '242686908422-9comn06kg90g9nj563ooapnijeu7pnk0.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "https://hiyrnow.in/backend/api/auth/google/callback",
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google Profile Data:', {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName
        });

        // Check if user already exists
        const existingUser = await UserModel.findOne({ 
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (existingUser) {
            // If user exists but doesn't have a googleId, update the record
            if (!existingUser.googleId) {
                existingUser.googleId = profile.id;
                await existingUser.save();
            }
            return done(null, existingUser);
        }

        // Create new user
        const newUser = new UserModel({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            username: profile.emails[0].value.split('@')[0],
            profilePicture: profile.photos[0].value,
            role: 'JobSeeker'
        });

        await newUser.save();
        done(null, newUser);
    } catch (error) {
        done(error, null);
    }
}));

module.exports = passport;