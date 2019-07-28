var Comments = require('../models/comments');
var Recipe = require('../models/recipe');

var middleware = {
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/login');
        }
    },

    isRecipeOwner: function(req, res, next) {
        if(req.isAuthenticated()) {
            Recipe.findById(req.params.id, (err, recipe) => {
                if(err) {
                    console.log(err);
                } else {
                    if(recipe.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        res.redirect('/recipes');
                    }
                }   
            });
        } else {
            res.redirect('/recipes');
        }
    }
}

module.exports = middleware;