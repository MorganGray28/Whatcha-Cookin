var express = require('express');
var router = express.Router();

router.get('/users/:userId', (req, res) => {
    res.send('this will be your user profile page');
});

router.post('/recipes/:id/favorite', (req, res) => {
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