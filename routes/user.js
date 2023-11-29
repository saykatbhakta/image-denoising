const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");

//-----------------------signup--------------------------------------

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup",wrapAsync (async (req, res) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to home page!");
            res.redirect("/homes");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
  

}));
//-------------------------login---------------------------------------

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    async (req, res) => {
        req.flash("success", "Welcome back to Home Page!");
        res.redirect("/homes");
    });

//-------------------------logout---------------------------------------

router.get("/logout", (req, res,next) => {
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/homes");
    })
});


module.exports = router;