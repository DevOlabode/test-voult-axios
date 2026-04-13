const express  = require('express');
const router = express.Router();
const controller = require('../controllers/google');

router.post('/authorize', controller.generateAuthUrl);
router.get('/callback', controller.handleCallback);

module.exports = router;
