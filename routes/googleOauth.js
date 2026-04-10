const express = require('express');
const router = express.Router();

const controller = require('../controllers/googleOauth');
const catchAsync = require('../utils/catchAsync');

router.post('/google/login', controller.googleLogin);

router.post('/google/register', controller.googleRegister);

module.exports = router;