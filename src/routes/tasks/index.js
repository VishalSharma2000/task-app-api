const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const taskRoute = require('./tasks');

router.use('/', auth, taskRoute);

module.exports = router;