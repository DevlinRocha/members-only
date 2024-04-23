const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const saltRounds = 10;
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const connectToDatabase = require("../utils/functions");

async function getUser(email) {
  try {
    const database = client.db(process.env.DATABASE);
    const posts = database.collection("users");
    const data = await posts.findOne({ email });

    return data;
  } catch (error) {
    console.error(error);
  }
}

router.get("/", async (req, res, next) => {
  try {
    await connectToDatabase(client);

    res.render("layout", {
      title: "Members Only",
      content: "sign_up",
      stylesheet: "/stylesheets/style.css",
      errors: null,
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
  async (req, res, next) => {
    // Handle the request

    try {
      await connectToDatabase(client);
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
      const user = await getUser(value);

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
    try {
      const errors = validationResult(req);
      console.log({ errors });
      console.log(errors.errors, errors.formatter);

      if (!errors.isEmpty()) {
        return res.status(400).render("layout", {
          title: "Members Only",
          content: "sign_up",
          message: "Something went wrong",
          errors: errors.errors,
          stylesheet: "/stylesheets/style.css",
        });
      }

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
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
);

module.exports = router;
