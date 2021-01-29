const express = require('express');
const router = express.Router();
const User = require('../../models/User');

const userAuth = require('./auth');
const userRoute = require('./users');
const auth = require('../../middleware/auth');

router.use('/auth', userAuth);
router.use('/', auth, userRoute);

module.exports = router;