const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { MongoClient } = require("mongodb");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 10;
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
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
  async (req, res, next) => {
    // Handle the request

    try {
      await db.connectToDatabase(client);
    } catch (error) {
      return next(error);
    } finally {
      return next();
    }
  },

  body("email")
    .isEmail()
    .withMessage("valid email is required")
    .custom(async (value) => {
      const user = await db.getUser("email", value, client);

      if (!user) {
        throw new Error("invalid email");
      }
    }),
  body("password").isLength({ min: 5 }).withMessage("invalid password"),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).render("layout", {
          title: "Members Only",
          content: "login-form",
          message: "Something went wrong",
          errors: errors.errors,
          stylesheet: "/stylesheets/style.css",
        });
      }

      // const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      // const database = client.db(process.env.DATABASE);
      // const users = database.collection("users");

      // await users.insertOne({
      //   username: req.body.username,
      //   email: req.body.email,
      //   password: hashedPassword,
      // });

      res.redirect("/");
    } catch (error) {
      return next(error);
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
);

module.exports = router;
