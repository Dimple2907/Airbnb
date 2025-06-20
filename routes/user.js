const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const { authLimiter, signupLimiter, usernameCheckLimiter } = require('../middleware/rateLimiter.js');

const userController = require('../controllers/user.js');

router
    .route("/signup")
    .get(userController.renderSignUpForm)
    .post(signupLimiter, wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
    authLimiter,
    saveRedirectUrl,
    passport.authenticate("local", { 
        failureFlash: true,
        failureRedirect: "/login" 
    }),userController.login);

// API endpoint for username availability check
router.get("/check-username/:username", usernameCheckLimiter, wrapAsync(userController.checkUsername));

//logout router
router.get("/logout",userController.logout);

// Forgot password routes
router.get('/forgot-password', userController.renderForgotPasswordForm);
router.post('/forgot-password', userController.handleForgotPassword);
router.get('/reset-password/:token', userController.renderResetPasswordForm);
router.post('/reset-password/:token', userController.handleResetPassword);

module.exports = router;
