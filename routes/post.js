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

    res.status(200).send(Object.values(posts));
  } catch (error) {
    next(error);
  } finally {
    await client.close();
  }
});

module.exports = router;
