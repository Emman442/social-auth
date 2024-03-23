// const passport = require('passport');
// const FacebookStrategy = require('passport-facebook').Strategy;
// const express = require('express');
// const User = require('../dal/models/user.model');

// const router = express.Router();
// require('dotenv').config();

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.APP_ID,
//       clientSecret: process.env.APP_SECRET,
//       callbackURL: "https://social-auth-fb9r.onrender.com",
//     },
//     async function (accessToken, refreshToken, profile, cb) {
//       console.log(profile)
//       const user = await User.findOne({
//         accountId: profile.id,
//         provider: "facebook",
//       });
//       if (!user) {
//         console.log("Adding new facebook user to DB..");
//         const user = new User({
//           accountId: profile.id,
//           name: profile.displayName,
//           provider: profile.provider,
//         });
//         await user.save();
//         // console.log(user);
//         return cb(null, profile);
//       } else {
//         console.log("Facebook User already exist in DB..");
//         // console.log(profile);
//         return cb(null, profile);
//       }
//     }
//   )
// );

// router.get('/', passport.authenticate('facebook', { scope: 'email' }));
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const User = require('../dal/models/user.model');

const router = express.Router();
require('dotenv').config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.APP_ID,
      clientSecret: process.env.APP_SECRET,
      callbackURL: "https://social-auth-fb9r.onrender.com",
    },
    async function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      const user = await User.findOne({
        accountId: profile.id,
        provider: "facebook",
      });
      if (!user) {
        console.log("Adding new facebook user to DB..");
        const newUser = new User({
          accountId: profile.id,
          name: profile.displayName,
          provider: profile.provider,
        });
        try {
          await newUser.save();
          console.log("New Facebook User Saved Successfully!");
        } catch (error) {
          console.error("Error saving user to database:", error);
        }
      } else {
        console.log("Facebook User already exists in DB..");
      }
      return cb(null, profile);
    }
  )
);

router.get('/', passport.authenticate('facebook', { scope: 'email' }));



router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/auth/facebook/success');
  }
);

router.get('/success', async (req, res) => {
  const userInfo = {
    id: req.session.passport.user.id,
    displayName: req.session.passport.user.displayName,
    provider: req.session.passport.user.provider,
  };
  res.render('fb-github-success', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via Facebook..'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out fb user' });
  }
});

module.exports = router;
