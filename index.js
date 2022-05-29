if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const appError = require("./utils/appError");
const session = require("express-session");
const flash = require("connect-flash"); 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const usersRoute = require("./routes/users");
const commentsRoute = require("./routes/comments");
const ejsMate = require("ejs-mate");
const mongoSanitize = require("express-mongo-sanitize");
const MongoDBStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || "mongodb://0.0.0.0:27017/commenter"
const secret = process.env.SESSION_KEY || "defaultsecretcode";
const name = process.env.SESSION_NAME || "sessiondefault";


let db_conn = mongoose.connect(dbUrl)
.then(() => {
        console.log("Connected to mongo database");
    }
)
.catch((err) => {
        console.log("Mongo connection error: ", err);
    }
);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(express.json());
app.disable('x-powered-by');

const port = process.env.PORT

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', `http://localhost:${port}`);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

app.listen(port, () => {
    console.log("Listening from the Heroku server");
})

const sessionConfig = {
    name,
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    },
    store: MongoDBStore.create({ mongoUrl: dbUrl }),
    touchAfter: 24*60*60
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use("/", usersRoute);
app.use("/", commentsRoute);

app.get("/", (req, res) => {
    res.redirect("/comments");
})

app.all("*", (req, res, next) => {
    next(new appError("Error code 404: page not found", 404));
})

app.use((err, req, res, next) => {
    if (!err.message) {
        err.message = "Something went wrong";
    }
    if (!err.status) {
        err.status = 500;
    }
    res.status(err.status).render("error", {err});
})