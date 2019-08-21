var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var middleware = require('../middleware');

// Landing Page
router.get('/', (req, res) => {
    res.redirect('/recipes');
    // res.render('landing');
});

// ****************************** Login/Register Routes *************************

// Get Register Page
router.get('/register', (req, res) => {
    res.render('register');
});

// Create Registered User
router.post('/register', (req, res) => {
    // If user doesn't register with avatar image url, we'll randomly assign one of the 4 preset avatar images we have in our public folder
    if(req.body.avatar) {
        var avatar = req.body.avatar;
    } else {
        avatar = '/img/Default-Icon-' + Math.floor(Math.random() * 4 + 1) + '.jpg'
    }
    var newUser = new User({ username: req.body.username, avatar:avatar });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/recipes');
            });
        }
    });
});

// Get Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// Post User Login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/recipes',
    failureRedirect: '/login'
    })
);

// Logout User
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

module.exports = router;