const comment = require("./models/comment");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first");
        res.redirect("/login");
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const foundComment = await comment.findById(req.params.id);
    if (!(foundComment && foundComment.user == req.user.username)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect("index");
    } else {
        next();
    }
}