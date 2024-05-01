const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const { connectToDatabase } = require("../../utils/db");

router.post("/", async (req, res, next) => {
  try {
    await connectToDatabase(client);
    const database = client.db(process.env.DATABASE);
    const posts = database.collection("posts");

    const result = await posts.insertOne({
      sender: req.user.username,
      content: req.body.post,
      timeSent: new Date().toISOString(),
    });

    res.status(200).send(result);
  } catch (error) {
    next(error);
  } finally {
    await client.close();
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await connectToDatabase(client);
    const database = client.db(process.env.DATABASE);
    const posts = database.collection("posts");

    const result = await posts.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.status(200).send(result);
  } catch (error) {
    next(error);
  } finally {
    await client.close();
  }
});

module.exports = router;
