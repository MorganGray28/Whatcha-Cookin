var express = require('express');
var router = express.Router();
var Recipes = require('../models/recipe');
var User = require('../models/user');
var passport = require('passport');
var middleware = require('../middleware');

// Landing Page
router.get('/', (req, res) => {
    res.render('landing');
});

// ****************************** Login/Register Routes *************************

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/recipes');
            });
        }
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/recipes',
    failureRedirect: '/login'
    })
);

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

module.exports = router;