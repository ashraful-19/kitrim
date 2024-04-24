const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const flash = require('connect-flash');
const { User, Otp, Session } = require('../models/userModel');

passport.use(
  new LocalStrategy({ usernameField: 'phone', passwordField: 'otp' }, async (phone, otp, done) => {
    const otpData = await Otp.findOne({ phone: phone }).sort({ "expires": 1 });

    if (!otpData) {
      const message = 'নতুন করে OTP পাঠান';
      flash('error', message);
      return done(null, false, { message });
    }

    if (otpData.otp !== otp) {
      const message = 'আপনার OTP টি সঠিক নয়!';
      flash('error', message);
      return done(null, false, { message });
    }

    User.findOne({ phone: phone }, (err, user) => {
      if (err) {
        console.error(err);
        return done(err);
      }

      if (!user) {
        const newUser = new User({ phone: phone });
        newUser.save((err, savedUser) => {
          if (err) {
            console.error(err);
            return done(err);
          }

          const successMessage = 'User created successfully!';
          flash('success', successMessage);
          return done(null, savedUser, { message: successMessage });
        });
      } else {
        // Delete session information associated with the user's phone number
        Session.deleteMany({ 'session.passport.user.phone': phone }, (err) => {
          if (err) {
            console.error('Error removing session information:', err);
            // Handle the error appropriately, e.g., return an error response
          } else {
            console.log('Session information deleted successfully');
            // Session information deleted successfully
          }
        });

        const successMessage = 'User authenticated successfully!';
        flash('success', successMessage);
        return done(null, user, { message: successMessage });
      }
    });
  })
);



passport.use(new GoogleStrategy({
  clientID: "452052023088-0htoto7m595602kskg368clafq4212tg.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('Google OAuth callback triggered');
  console.log('Profile information:', profile);
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        phone: "", 
        profile_pic: profile.photos[0].value
      });
    } else {
      console.log('User found:', user);
    }
    return done(null, user);
  } catch (error) {
    console.error('Error during Google OAuth:', error);
    return done(error);
  }
}));

    passport.serializeUser((user, done) => {
      done(null, { id: user.id, phone: user.phone, googleId: user.googleId }); // Serialize user id and phone number
    });

    passport.deserializeUser((serializedUser, done) => {
      User.findById(serializedUser.id, (err, user) => {
        done(err, user);
      });
    });
    