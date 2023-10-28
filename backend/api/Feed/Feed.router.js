const express = require("express");
const {checkJwt} = require("../checkjwt.js");

const {get_init_feed_data, createPost, likePost, likeComment, createComment, createDocument} = require("./Feed.service.js")

const router = express.Router();

router.get("/get_feed_init_data/", checkJwt, get_init_feed_data);

router.post("/create_post/", checkJwt, createPost)

router.post('/create_document/', checkJwt, createDocument)

router.post('/like_post/', checkJwt, likePost)

router.post('/create_comment/', checkJwt, createComment)

router.post('/like_comment/', checkJwt, likeComment)

module.exports = router;