const express = require("express");
const {checkJwt} = require("../checkjwt")

const router = express.Router();

const { create, get_locality } = require("./Scenes.service")

router.get("/", checkJwt, (req, res) => {
    console.log(req.user)
})

router.post("/create/", checkJwt, create)

router.get("/get_locality/:latlng", checkJwt, get_locality)

module.exports = router