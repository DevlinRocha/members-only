const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const { connectToDatabase, getDocs } = require("../utils/db");

router.get("/", async (req, res, next) => {
  try {
    await connectToDatabase(client);
    const posts = await getDocs("posts", client).catch(console.dir);

    res.render("layout", {
      title: "Members Only",
      content: "index",
      stylesheet: "/stylesheets/style.css",
      post_list: posts,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
