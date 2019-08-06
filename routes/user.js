var express = require('express');
var User = require('../models/user');
var router = express.Router();
var middleware = require('../middleware/index');

// User Profile Route
router.get('/users/:userId', middleware.isProfileOwner, (req, res) => {
    User.findById(req.user._id).populate('favorites').populate('userRecipes').exec((err, user) => {
        res.render('profile', { user: user });
    });
});

// Create Favorites Route
router.post('/recipes/:id/favorite', middleware.isLoggedIn, (req, res) => {
    var recipeId = req.params.id;
    // Check to see if recipe ObjectId is already in our user.favorites array
    var userFavorited = req.user.favorites.some((favorite) => {
        return favorite.equals(recipeId);
    });
    // If it is, then remove that recipe ObjectId from the array and save the user
    if(userFavorited) {
        req.user.favorites.pull(recipeId);
        req.user.save();
        res.redirect('back');
    // If it isn't already in user's favorites array, add it to the array and save the user
    } else {
        req.user.favorites.push(recipeId);
        req.user.save();
        res.redirect('back');
    }
    
});
module.exports = router;