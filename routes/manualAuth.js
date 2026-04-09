const express = require('express');
const router = express.Router();

const controller = require('../controllers/manualAuth');
const redirectIfLoggedIn = require('../middleware/redirectIfLoggedIn');

router.get('/register', redirectIfLoggedIn, controller.registerForm);

router.post('/register', controller.register);

router.get('/login', redirectIfLoggedIn, controller.loginForm);

router.post('/login', controller.login);

router.post('/logout', controller.logout);

module.exports = router;
