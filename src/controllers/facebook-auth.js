
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const User = require('../dal/models/user.model');
const facebookAuth= require("../dal/facebook-auth.dal")

const router = express.Router();
require('dotenv').config();



let userProfile;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.APP_ID,
      clientSecret: process.env.APP_SECRET,
      callbackURL: "https://social-auth-fb9r.onrender.com/auth/facebook/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      console.log("profile: ", profile);
      userProfile = profile;
      return cb(null, userProfile);
     
    }
  )
);

router.get('/', passport.authenticate('facebook', { scope: 'email' }));



router.get(
  "/callback",
  passport.authenticate("facebook", { failureRedirect: "/auth/facebook/error" }),
  (req, res) => {
    res.redirect("/auth/facebook/success"); // Successful authentication, redirect success.
  }
);

router.get("/success", async (req, res) => {
  const { failure, success } = await facebookAuth.registerWithFacebook(userProfile);

  console.log("from success:  ", userProfile)
  if (failure) console.log("Facebook user already exist in DB..");
  else console.log("Registering new Facebook user..");
  res.render("success", { user: userProfile });
});


module.exports = router;
