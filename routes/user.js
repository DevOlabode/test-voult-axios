const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');

// router.use(authMiddleware);

const controller = require('../controllers/user');

router.get('/profile', controller.getProfile);

router.get('/update-profile', controller.updateProfileForm);

router.post('/profile', controller.editProfile);

module.exports = router;