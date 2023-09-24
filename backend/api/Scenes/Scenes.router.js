const express = require("express");
const {checkJwt} = require("../checkjwt")

const router = express.Router();

const { create, get_locality, get_scenes, join_scene } = require("./Scenes.service")

// create scene
// takes in center, user, range
// returns true if the scene was created
router.post("/create/", checkJwt, create);

router.post('/join/', checkJwt, join_scene)

// get locality
// takes in a latlng array
// returns the city for those coords
router.get("/get_locality/:latlng", checkJwt, get_locality);

router.get("/get_scenes", checkJwt, get_scenes);

module.exports = router