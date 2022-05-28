const comment = require("../models/comment");
const appError = require("../utils/appError");

module.exports.index = async (req, res, next) => {
    try {
        let input_length = await comment.count();
        if (req.session.commentsNum && req.session.commentsNum>=5) {
            let comments = await comment.find({}).sort({timestamp:-1}).limit(req.session.commentsNum);
            let commentsNum = req.session.commentsNum;
            delete req.session.commentsNum;
            res.render("comments/main", {comments, input_length, page: req.url, commentsNum});
        } else {
            let comments = await comment.find({}).sort({timestamp:-1}).limit(5);
            res.render("comments/main", {comments, input_length, page: req.url, commentsNum:5});
        }
    } catch {
        next(new appError("MongoDB query failed", 500));
    }
}

module.exports.commentForm = (req, res) => {
    res.render("comments/new");
}

module.exports.newComment = async (req, res) => {
    let new_cont = new comment(req.body);
    new_cont.user = req.user.username;
    new_cont.timestamp = new Date();
    await new_cont.save();
    req.flash("success", "Successfully created a comment");
    res.redirect("/comments")
}

module.exports.editForm = async (req, res) => {
    if (req.query.url.indexOf("history")!=-1) {
        req.session.historyNum=req.query.num;
    } else if (req.query.url.indexOf("profile")!=-1) {
        req.session.profileNum=req.query.num;
    } else {
        req.session.commentsNum=req.query.num;
    }
    const foundComment = await comment.findById(req.params.id);
    res.render("comments/edit", {foundComment, page:req.query.url});
}

module.exports.editedComment = async (req, res) => {
    console.log(req)
    await comment.findByIdAndUpdate(req.params.id, {comment:req.body.comment});
    req.flash("success", "Successfully updated comment");
    console.log(req.body);
    res.redirect(req.body.url);
}

module.exports.deleteComment = async (req, res) => {
    console.log(req)
    if (req.body.url.indexOf("history")!=-1) {
        req.session.historyNum=req.body.num-1;
    } else if (req.body.url.indexOf("profile")!=-1) {
        req.session.profileNum=req.body.num-1;
    } else {
        req.session.commentsNum=req.body.num-1;
    }
    await comment.findByIdAndRemove(req.params.id);
    req.flash("success", "Successfully deleted comment");
    res.redirect(req.body.url);
}

module.exports.getData = async (req, res, next) => {
    let criteria = req.body;
    try {
        payload = await comment.find(criteria.conditions).sort({timestamp:-1}).skip(criteria.post_n).limit(5);
        res.send(payload);
    } catch {
        next(new appError("MongoDB query failed", 500));
    }
}

module.exports.history = async (req, res, next) => {
    if (req._parsedOriginalUrl.query==null) {
        res.render("comments/history", {comments:undefined, input_length:undefined, user:"", startDate:"", endDate:"", page: req.url});
    } else {
        let content = req.query;
        let conditions = {};
        if (content.user) {
            conditions.user = content.user;
        }
        if (content.startDate && content.endDate) {
            conditions.$and = [{timestamp:{$gt: new Date(content.startDate)}}, {timestamp:{$lt: new Date(content.endDate)}}];
        } else if (content.startDate) {
            conditions.timestamp = {$gt: new Date(content.startDate)};
        } else if (content.endDate) {
            conditions.timestamp = {$lt: new Date(content.endDate)};
        }
        try {
            input_length = await comment.find(conditions).count();
            if (req.session.historyNum && req.session.historyNum>=5) {
                let comments = await comment.find(conditions).sort({timestamp:-1}).limit(req.session.historyNum);
                let historyNum = req.session.historyNum;
                delete req.session.historyNum;
                res.render("comments/history", {comments, input_cond:conditions, input_length, user:content.user, startDate:content.startDate, endDate:content.endDate, page: req.url, historyNum});
            } else {
                let comments = await comment.find(conditions).sort({timestamp:-1}).limit(5);
                res.render("comments/history", {comments, input_cond:conditions, input_length, user:content.user, startDate:content.startDate, endDate:content.endDate, page: req.url, historyNum:5});
            }
        } catch {
            next(new appError("MongoDB query failed", 500));
        }
    }
}