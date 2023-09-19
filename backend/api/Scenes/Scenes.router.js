const express = require("express");
const {checkJwt} = require("../checkjwt")

const router = express.Router();

const { create, get_locality } = require("./Scenes.service")

// create scene
// takes in center, user, range
// returns true if the scene was created
router.post("/create/", checkJwt, create)

// get locality
// takes in a latlng array
// returns the city for those coords
router.get("/get_locality/:latlng", checkJwt, get_locality)

module.exports = router