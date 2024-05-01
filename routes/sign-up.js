const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const saltRounds = 10;
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const { connectToDatabase, getDoc } = require("../utils/db");

router.get("/", async (req, res, next) => {
  try {
    await connectToDatabase(client);

    res.render("layout", {
      title: "Members Only",
      content: "sign-up-form",
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

  body("email")
    .isEmail()
    .withMessage("valid email is required")
    .custom(async (value) => {
      const user = await getDoc("users", "email", value, client);

      if (user) {
        throw new Error("email already in use");
      }
    }),
  body("password")
    .isLength({ min: 5 })
    .withMessage("password is not long enough"),
  body("passwordConfirmation")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("passwords do not match"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("layout", {
        title: "Members Only",
        content: "sign-up-form",
        message: "Something went wrong",
        errors: errors.errors,
        stylesheet: "/stylesheets/style.css",
      });
    }

    try {
      await connectToDatabase(client);

      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      const database = client.db(process.env.DATABASE);
      const users = database.collection("users");

      await users.insertOne({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      res.redirect("/");
    } catch (error) {
      return next(error);
    } finally {
      await client.close();
    }
  }
);

module.exports = router;
