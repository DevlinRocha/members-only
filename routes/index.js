const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const connectToDatabase = require("../utils/functions");

async function getPosts() {
  try {
    const database = client.db(process.env.DATABASE);
    const posts = database.collection("posts");
    const data = await posts.find().toArray();
    return data;
  } catch (error) {
    console.error(error);
  }
}

router.get("/", async (req, res, next) => {
  try {
    await connectToDatabase(client);
    const posts = await getPosts().catch(console.dir);

    res.render("layout", {
      title: "Members Only",
      content: "index",
      stylesheet: "/stylesheets/style.css",
      post_list: posts,
    });
  } catch (error) {
    console.error(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

module.exports = router;
