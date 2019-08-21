var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Recipe = require('../models/recipe');
var Comment = require('../models/comments');
var middleware = require('../middleware/index');

// Create Comment
router.post('/recipes/:id/comments', middleware.isLoggedIn, (req, res) => {
    var comment = {
        text: req.body.comment,
        author: {
            id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        }
    } 
    // Find Recipe we're commenting on
    Recipe.findById(req.params.id, (err, recipe) => {
        if(err) {
            console.log(err);
        } else {
            Comment.create(comment, (err, comment) => {
                if(err) {
                    console.log(err);
                } else {
                    // Add comment to Recipe's array of comments that will be populated when rendered
                    recipe.comments.push(comment);
                    recipe.save();
                    res.redirect('/recipes/' + req.params.id);
                }
            });
        }
    });
});

// Delete Comment
router.delete('/recipes/:id/comments/:commentId', middleware.isCommentOwner, (req, res) => {
    // 
    var commentId = req.params.commentId;
    Comment.findByIdAndDelete(commentId, (err, comment) => {
        if(err) {
            console.log(err);
        } else {
            Recipe.findById(req.params.id, (err, recipe) => {
                if (err) {
                    console.log(err);
                } else {
                    // Find the Comment's index in the Recipe's array of Comments, splice 1 element starting from that index
                    var commentIndex = recipe.comments.indexOf(comment._id);
                    if (commentIndex > -1) {
                        recipe.comments.splice(commentIndex, 1);
                        // Save Recipe update without the deleted comment
                        recipe.save();
                        res.redirect('/recipes/' + req.params.id);
                    }
                }
            });
        }
    });
});


module.exports = router;