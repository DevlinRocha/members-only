const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const passport = require("passport");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const db = require("../utils/db");

router.get("/", async (req, res, next) => {
  try {
    await db.connectToDatabase(client);

    res.render("layout", {
      title: "Members Only",
      content: "login-form",
      stylesheet: "/stylesheets/style.css",
      errors: null,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
});

router.post("/", async (req, res, next) => {
  passport.authenticate(
    "local",
    {
      successRedirect: "/",
      failureRedirect: "/login",
    },
    (error, user, info, status) => {
      if (error || !user) {
        return res.status(400).render("layout", {
          title: "Members Only",
          content: "login-form",
          message: "Something went wrong",
          user,
          errors: [error],
          stylesheet: "/stylesheets/style.css",
        });
      }

      return next();
    }
  )(req, res, next);
});

module.exports = router;
