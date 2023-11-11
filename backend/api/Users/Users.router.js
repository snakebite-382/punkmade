const express = require('express');
const  {checkJwt} = require('../checkjwt.js');

const router = express.Router();

const {loggedin, userinfo, updateInfo, getProfile, leaveScene, preferScene, doneOnboarding, getNotifs, dismissNotif} = require('./Users.service.js');

router.get('/loggedin/', checkJwt, loggedin);

router.get('/userinfo/', checkJwt, userinfo);

router.get('/get_profile/:userID', checkJwt, getProfile);

router.post('/update_info/', checkJwt, updateInfo);

router.post('/leave_scene', checkJwt, leaveScene);

router.post('/prefer_scene/', checkJwt, preferScene);

router.post('/dismiss_notif/', checkJwt, dismissNotif)

router.get('/done_onboarding/', checkJwt, doneOnboarding);

router.get('/get_notifs/', checkJwt, getNotifs);

module.exports = router
