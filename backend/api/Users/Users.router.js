const express = require('express')
const  {checkJwt} = require('../checkjwt')

const router = express.Router();

const {loggedin} = require('./Users.service')

router.get('/loggedin/:userID', checkJwt, loggedin)

module.exports = router