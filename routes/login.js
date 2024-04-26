const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const passport = require("passport");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const { connectToDatabase } = require("../utils/db");

router.get("/", async (req, res, next) => {
  try {
    await connectToDatabase(client);

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

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.use((error, req, res, next) => {
  if (error || !req.user) {
    return res.status(400).render("layout", {
      title: "Members Only",
      content: "login-form",
      message: "Something went wrong",
      user: req.user,
      errors: [error],
      stylesheet: "/stylesheets/style.css",
    });
  }
  next();
});

module.exports = router;
