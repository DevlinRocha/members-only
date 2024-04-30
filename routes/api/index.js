const express = require("express");
const router = express.Router();
const postApi = require("./post");

router.use("/post", postApi);

module.exports = router;
