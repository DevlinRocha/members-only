const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const db = require("../utils/db");

async function getPosts() {
  try {
    const database = client.db(process.env.DATABASE);
    const posts = database.collection("posts");
    const data = await posts.find().sort({ timeSent: -1 }).toArray();
    return data;
  } catch (error) {
    console.error(error);
  }
}

router.get("/", async (req, res, next) => {
  try {
    await db.connectToDatabase(client);
    const posts = await getPosts().catch(console.dir);

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
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

router.post(
  "/",
  async (req, res, next) => {
    try {
      await db.connectToDatabase(client);
    } catch (error) {
      console.error(err);
    } finally {
      next();
    }
  },
  async (req, res, next) => {
    try {
      const database = client.db(process.env.DATABASE);
      const posts = database.collection("posts");
      await posts.insertOne({
        sender: req.user.username,
        content: req.body.post,
        timeSent: new Date().toISOString(),
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

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
