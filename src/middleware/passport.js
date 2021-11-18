/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/user');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

module.exports = function (passport) {
  // local strategy passport
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        let user;
        try {
          user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'No user by that email' });
          }
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            }
            return done(null, false, { message: 'Not a matching password' });
          });
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
  // JWT strategy passport
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, cb) => {
        try {
          const user = await User.findById(jwtPayload._id);
          return cb(null, user);
        } catch (err) {
          return cb(err);
        }
      },
    ),
  );

  // Google strategy passport
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/users/login/google/redirect',
      },
      async (request, accessToken, refreshToken, profile, done) => {
        const user = profile._json;
        try {
          dbUser = await User.findOne({ email: user.email });
          if (!dbUser) {
            const newUser = new User({
              name: user.name,
              email: user.email,
              password: user.sub,
            });
            await newUser.save();
            done(null, newUser);
          } else {
            done(null, dbUser);
          }
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.email);
  });

  passport.deserializeUser(async (email, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(new Error('user not found'));
      }
      done(null, user);
    } catch (e) {
      done(e);
    }
  });
};
