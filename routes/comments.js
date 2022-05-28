const express = require("express");
router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isAuthor} = require("../middleware");
const {inputSchema} = require("../inputValidation");
const appError = require("../utils/appError");
const comment = require("../models/comment");
const comments = require("../controllers/comments");

function validateComment (req, res, next) {
    const {error} = inputSchema.validate(req.body);
    if (error) {
        throw new appError(error, 500);
    } else {
        next();
    }
}

router.get("/", wrapAsync(comments.index))

router.route("/new")
.get(isLoggedIn, comments.commentForm)
.post(validateComment, wrapAsync(comments.newComment))

router.get("/:id/edit", isLoggedIn, isAuthor, wrapAsync(comments.editForm))

router.route("/:id")
.put(isLoggedIn, isAuthor, validateComment, wrapAsync(comments.editedComment))
.delete(isLoggedIn, isAuthor, wrapAsync(comments.deleteComment))

router.post("/getData", wrapAsync(comments.getData))

router.get("/history", wrapAsync(comments.history))

module.exports = router;