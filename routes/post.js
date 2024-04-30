const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const { connectToDatabase, getDocs } = require("../utils/db");

router.get("/", async (req, res, next) => {
  try {
    await connectToDatabase(client);
    const posts = await getDocs("posts", client).catch(console.dir);

    res.send(Object.values(posts));
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
});

router.post("/", async (req, res, next) => {
  try {
    await connectToDatabase(client);
    const database = client.db(process.env.DATABASE);
    const posts = database.collection("posts");

    await posts.insertOne({
      sender: req.user.username,
      content: req.body.post,
      timeSent: new Date().toISOString(),
    });

    res.redirect("/");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
});

module.exports = router;
