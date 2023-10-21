const express = require("express");
const {checkJwt} = require("../checkjwt.js")

const router = express.Router();

const { create, get_locality, get_scenes, join_scene } = require("./Scenes.service.js")

router.post("/create/", checkJwt, create);

router.post('/join/', checkJwt, join_scene)

router.get("/get_locality/:latlng", checkJwt, get_locality);

router.get("/get_scenes", checkJwt, get_scenes);

module.exports = router