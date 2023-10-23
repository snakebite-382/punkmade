const express = require('express')
const  {checkJwt} = require('../checkjwt.js')

const router = express.Router();

const {loggedin, userinfo} = require('./Users.service.js')

router.get('/loggedin/', checkJwt, loggedin)

router.get('/userinfo/', checkJwt, userinfo)

module.exports = router
