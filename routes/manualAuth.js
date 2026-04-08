const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

const controller = require('../controllers/manualAuth');

router.get('/register', controller.registerForm);

router.post('/register', controller.register);

router.get('/login', controller.loginForm);

router.post('/login', controller.login);

router.post('/logout', controller.logout);

module.exports = router;