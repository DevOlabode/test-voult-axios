const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

const controller = require('../controllers/user');

router.get('/profile', controller.getProfile);

router.patch('/profile', controller.editProfile);

module.exports = router;