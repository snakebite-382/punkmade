const express = require("express");
const {checkJwt} = require("../checkjwt");

const {get_init_feed_data, getPosts, createPost, likePost} = require("./Feed.service")

const router = express.Router();


// gets the inital data for the feed
// takes in user_id
// spits out app_metadata = {preferredScene= 'Scene ID', Scenes: ['Scene IDs']}, and Scenes = [{Scene Objects}]
router.get("/get_feed_init_data/:user_id", checkJwt, get_init_feed_data);

// gets posts for a category for indexes [indexStart, indexEnd)
// tales in scene, category, indexStart, indexEnd
// spits out posts=[{Post Objects}]
router.get("/get_posts/:scene/:category/:indexStart/:indexEnd", checkJwt, getPosts)

// creates a post
// takes in scene, category, content, user, type
// returns the newPost = {Post}
router.post("/create_post/", checkJwt, createPost)

router.post('/like_post/', checkJwt, likePost)

module.exports = router;