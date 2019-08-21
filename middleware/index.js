var Comment = require('../models/comments');
var Recipe = require('../models/recipe');

var middleware = {
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            req.flash('error', 'Please log in');
            res.redirect('/login');
        }
    },

    isRecipeOwner: function(req, res, next) {
        if(req.isAuthenticated()) {
            Recipe.findById(req.params.id, (err, recipe) => {
                if(err || !recipe) {
                    req.flash('error', 'Recipe not found');
                    res.redirect('/recipes');
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
    },

    isCommentOwner: function(req, res, next) {
        if(req.isAuthenticated()) {
            Comment.findById(req.params.commentId, (err, comment) => {
                if(err) {
                    console.log(err);
                } else {
                    if(comment.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        res.redirect('/recipes');
                    }
                }
            });
        }
    },

    isProfileOwner: function(req, res, next) {
        if(req.isAuthenticated()) {
            if(req.user._id.equals(req.params.userId)) {
                next();
            } else {
                res.redirect('/login');
            }
        }
    }
}

module.exports = middleware;