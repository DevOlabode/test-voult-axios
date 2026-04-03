const express = require('express');
const router = express.Router();

const controller = require('../controllers/googleOauth');

router.post('/google', controller.googleLogin);

router.post('/google', controller.googleRegister);


module.exports = router;