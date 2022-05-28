const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema ({
    user: {
        type:String,
        required:true
    },
    comment: {
        type:String,
        required:true
    },
    timestamp: {
        type:Date,
        required:true
    }
})

const comment = mongoose.model("Comment", commentSchema);

module.exports = comment;