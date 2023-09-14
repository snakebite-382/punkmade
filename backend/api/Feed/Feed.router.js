const express = require("express");
const {checkJwt} = require("../checkjwt");

const {get_init_feed_data, getPosts, createPost} = require("./Feed.service")

const router = express.Router();

router.get("/get_feed_init_data/:user_id", checkJwt, get_init_feed_data);

router.get("/get_posts/:scene/:category", checkJwt, getPosts)

router.post("/create_post/", checkJwt, createPost)

module.exports = router;