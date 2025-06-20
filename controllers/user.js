const crypto = require('crypto');
const User = require("../models/user");

// Security utilities
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>\"']/g, '');
};

const isValidPassword = (password) => {
    // At least 8 characters, with letters and numbers
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};


module.exports.renderSignUpForm = (req, res) => {
    res.render('users/signup.ejs');
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        
        // Sanitize inputs
        username = sanitizeInput(username);
        email = sanitizeInput(email);
        
        // Additional validation
        if (!username || !email || !password) {
            req.flash("error", "All fields are required!");
            return res.redirect("/signup");
        }
        
        // Username validation
        if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
            req.flash("error", "Username must be 3-20 characters long and contain only letters and numbers!");
            return res.redirect("/signup");
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.flash("error", "Please enter a valid email address!");
            return res.redirect("/signup");
        }
        
        // Enhanced password validation
        if (!isValidPassword(password)) {
            req.flash("error", "Password must be at least 8 characters long and contain both letters and numbers!");
            return res.redirect("/signup");
        }
        
        let newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        
        req.login(registeredUser, (err) => {
            if (err) { return next(err); }
            req.flash("success", `Welcome to Wanderlust, ${username}! Your account has been created successfully.`);
            res.redirect("/listings");
        });
    } catch (e) {
        let errorMessage = e.message;
        
        // Customize error messages for better UX
        if (e.message.includes('duplicate')) {
            if (e.message.includes('username')) {
                errorMessage = "Username is already taken. Please choose a different one.";
            } else if (e.message.includes('email')) {
                errorMessage = "Email is already registered. Please use a different email or try logging in.";
            }
        } else if (e.message.includes('User validation failed')) {
            errorMessage = "Please check your input and try again.";
        }
        
        req.flash("error", errorMessage);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => {
    res.render('users/login.ejs');
};

module.exports.login = async (req, res, next) => {
    const { username } = req.user;
    req.flash("success", `Welcome back, ${username}! Good to see you again.`); 
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};


module.exports.logout = (req, res, next) => {
    const username = req.user ? req.user.username : '';
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash("success", username ? `Goodbye ${username}! You have been logged out successfully.` : "You have been logged out successfully!");
        res.redirect("/listings");
    });
};

module.exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Validate username format
        if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
            return res.json({ 
                available: false, 
                message: "Invalid username format" 
            });
        }
        
        // Check if username exists
        const existingUser = await User.findOne({ username: username });
        
        if (existingUser) {
            return res.json({ 
                available: false, 
                message: "Username is already taken" 
            });
        }
        
        res.json({ 
            available: true, 
            message: "Username is available" 
        });
    } catch (error) {
        res.status(500).json({ 
            available: false, 
            message: "Error checking username availability" 
        });
    }
};

module.exports.renderForgotPasswordForm = (req, res) => {
    res.render('users/forgot-password.ejs');
};

module.exports.handleForgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        req.flash('error', 'No account with that email found.');
        return res.redirect('/forgot-password');
    }
    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    // For demo: show link instead of sending email
    req.flash('success', `Password reset link: /reset-password/${token}`);
    res.redirect('/forgot-password');
};

module.exports.renderResetPasswordForm = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-password');
    }
    res.render('users/reset-password.ejs', { token });
};

module.exports.handleResetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-password');
    }
    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/reset-password/${token}`);
    }
    await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    req.flash('success', 'Your password has been updated. You can now log in.');
    res.redirect('/login');
};