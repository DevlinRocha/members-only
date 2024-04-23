const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

require("dotenv").config();
const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);

router.get("/", async (req, res, next) => {
  const posts = await getPosts().catch(console.dir);

  res.render("layout", {
    title: "Members Only",
    content: "index",
    stylesheet: "/stylesheets/style.css",
    message_list: posts,
  });
});

async function getPosts() {
  try {
    const database = client.db("dev");
    const posts = database.collection("posts");
    const data = await posts.find().toArray();
    return data;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

module.exports = router;
