const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { MongoClient } = require("mongodb");
const { isAuth } = require("../utils/auth");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const { connectToDatabase } = require("../utils/db");

router.get("/:username", isAuth, (req, res, next) => {
  res.render("layout", {
    title: "Members Only",
    content: "username",
    stylesheet: "/stylesheets/style.css",
    user: req.user,
    errors: null,
  });
});

router.post(
  "/:username",
  body("secretWord")
    .custom((value) => {
      return value === process.env.SECRET_WORD;
    })
    .withMessage("incorrect word"),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).render("layout", {
          title: "Members Only",
          content: "username",
          message: "incorrect word",
          errors: errors.errors,
          stylesheet: "/stylesheets/style.css",
          user: req.user,
        });
      }

      await connectToDatabase(client);

      const database = client.db(process.env.DATABASE);
      const users = database.collection("users");

      await users.updateOne(
        {
          _id: req.user._id,
        },
        { $set: { admin: true } }
      );

      res.redirect("/");
    } catch (error) {
      return next(error);
    } finally {
      await client.close();
    }
  }
);

module.exports = router;
