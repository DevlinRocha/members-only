const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_CONNECTION;
const client = new MongoClient(uri);
const { connectToDatabase, getDocs } = require("../utils/db");
const loginRouter = require("./login");
const postRouter = require("./post");
const signUpRouter = require("./sign-up");
const userRouter = require("./user");

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
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/");
  });
});

router.use("/login", loginRouter);
router.use("/post", postRouter);
router.use("/sign-up", signUpRouter);
router.use("/user", userRouter);

module.exports = router;
