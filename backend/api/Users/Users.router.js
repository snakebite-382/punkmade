const express = require('express')
const  {checkJwt} = require('../checkjwt.js')

const router = express.Router();

const {loggedin, userinfo, updateInfo, getProfile} = require('./Users.service.js')

router.get('/loggedin/', checkJwt, loggedin)

router.get('/userinfo/', checkJwt, userinfo)

router.get('/get_profile/:userID', checkJwt, getProfile)

router.post('/update_info/', checkJwt, updateInfo)

module.exports = router
