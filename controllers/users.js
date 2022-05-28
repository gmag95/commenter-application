const User = require("../models/user");
const appError = require("../utils/appError");
const comment = require("../models/comment");

module.exports.registerForm = (req, res) => {
    res.render("users/register");
}

module.exports.userRegister = async (req, res) => {
    if (req.body.regCode==process.env.REG_CODE) {
        try {
            const {email, username, password} = req.body;
            const user = new User({email, username});
            user.regDate = new Date();
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, (err) => {
                if(err) return next(err);
                req.flash("success", "User created successfully");
                res.redirect("/comments");
            }) }
        catch (error) {
            req.flash("error", error.message)
            res.redirect("/register");
        }
    } else {
        req.flash("error", "Wrong registration code")
        res.redirect("/register");
    }
}

module.exports.loginForm = (req, res) => {
    res.render("users/login");
}

module.exports.userLogin = (req, res) => {
    req.flash("success", `Welcome back ${req.body.username}`);
    const redirectUrl = req.session.returnTo || "/comments";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.userLogout = (req, res) => {
    req.logout();
    req.flash("success", "Logged you out successfully");
    res.redirect("/comments");
}

module.exports.profile = async (req, res, next) => {
    try {
        let input_length = await comment.find({user:req.user.username}).sort({timestamp:-1}).count();
        if (req.session.profileNum && req.session.profileNum>=5) {
            let comments = await comment.find({user:req.user.username}).sort({timestamp:-1}).limit(req.session.profileNum);
            let profileNum = req.session.profileNum;
            delete req.session.profileNum;
            res.render("users/profile", {comments, input_length, page: req.url, profileNum});
        } else {
            let comments = await comment.find({user:req.user.username}).sort({timestamp:-1}).limit(5);
            res.render("users/profile", {comments, input_length, page: req.url, profileNum:5});
        }
        
    } catch  {
        next(new appError("MongoDB query failed", 500));
    }
}