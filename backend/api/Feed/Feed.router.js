const express = require("express");
const {checkJwt} = require("../checkjwt.js");

const {get_init_feed_data, createPost, likePost, likeComment, createComment, createDocument, getDocument, reportMedia, voteToRemove, getPostByID} = require("./Feed.service.js");

const router = express.Router();

router.get("/get_feed_init_data/", checkJwt, get_init_feed_data);

router.get('/get_document/:docID', getDocument);

router.post("/create_post/", checkJwt, createPost);

router.post('/create_document/', checkJwt, createDocument);

router.post('/like_post/', checkJwt, likePost);

router.post('/create_comment/', checkJwt, createComment);

router.post('/like_comment/', checkJwt, likeComment);

/**
 * @param { * } req.body.mediaID id of the post, comment or document to  
 */
router.post('/report_media/', checkJwt, reportMedia);

router.post('/vote_to_remove/', checkJwt, voteToRemove);

router.get('/get_post/:id', checkJwt, getPostByID)

module.exports = router;
