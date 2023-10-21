const express = require('express')
const  {checkJwt} = require('../checkjwt.js')

const router = express.Router();

const {loggedin} = require('./Users.service.js')

router.get('/loggedin/', checkJwt, loggedin)

module.exports = router
