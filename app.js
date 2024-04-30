const createError = require("http-errors");
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const MongoStore = require("connect-mongo");
const { getDoc } = require("./utils/db");

const indexRouter = require("./routes/index");
const postRouter = require("./routes/post");
const signUpRouter = require("./routes/sign-up");
const loginRouter = require("./routes/login");
const userRouter = require("./routes/user");

const app = express();

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_CONNECTION,
  dbName: process.env.DATABASE,
  collectionName: process.env.SESSIONS_COLLECTION,
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SECRET_WORD,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      // 1,000ms = 1s * 60 = 1m * 60 = 1hr * 24 = 1d * 7 = 1w
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getDoc("users", "_id", new ObjectId(id), client);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await getDoc("users", "email", email, client);

        if (!user) {
          return done({ msg: "incorrect email" }, false, null);
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done({ msg: "incorrect password" }, false, null);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

app.use("/", indexRouter);
app.use("/post", postRouter);
app.use("/sign-up", signUpRouter);
app.use("/login", loginRouter);
app.use("/user", userRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((error, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = error.message;
  res.locals.error = req.app.get("env") === "development" ? error : {};

  res.status(error.status || 500);
  res.render("error", { user: req.user });
});

module.exports = app;
