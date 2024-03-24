const router = require("express").Router()
const passport = require('passport');

const express = require('express');
const User = require('../dal/models/user.model');
const tiktokAuth = require("../dal/tiktok-auth.dal");


const TiktokStrategy = require('passport-tiktok-auth').Strategy;


let userProfile;
passport.use(
  new TiktokStrategy(
    {
      clientID: "7336702696353515525",
      clientSecret: "rWVCeJYhukATmMEbMVwaw6kZREYzJQL0",
      scope: ["user.info.basic"],
      callbackURL: "https://social-auth-fb9r.onrender.com/auth/tiktok/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile)
      User.findOrCreate({ tiktokId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  )
);

router.get("/", passport.authenticate("tiktok"));

router.get(
  "/callback",
  passport.authenticate("tiktok", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/auth/tiktok/success");
  }
);

router.get("/success", async (req, res) => {
  const { failure, success } = await tiktokAuth.registerWithTiktok(
    userProfile
  );

  console.log("from success:  ", userProfile);
  if (failure) console.log("Facebook user already exist in DB..");
  else console.log("Registering new Facebook user..");
  res.render("success", { user: userProfile });
});


module.exports = router