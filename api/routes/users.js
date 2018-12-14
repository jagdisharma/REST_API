const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const UserController = require('../controllers/users');

router.post('/signup', UserController.signupUser );

router.post('/login', UserController.loginUser);

router.delete('/:userId', checkAuth, UserController.deleteUser);

module.exports = router;