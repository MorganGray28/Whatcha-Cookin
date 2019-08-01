var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Recipe = require('../models/recipe');
var Comment = require('../models/comments');
var middleware = require('../middleware/index');

router.post('/recipes/:id/comments', middleware.isLoggedIn, (req, res) => {
    var comment = {
        text: req.body.comment,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    } 
    Recipe.findById(req.params.id, (err, recipe) => {
        if(err) {
            console.log(err);
        } else {
            Comment.create(comment, (err, comment) => {
                if(err) {
                    console.log(err);
                } else {
                    recipe.comments.push(comment);
                    recipe.save();
                    res.redirect('/recipes/' + req.params.id);
                }
            });
        }
    });
});

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
                    var commentIndex = recipe.comments.indexOf(comment._id);
                    if (commentIndex > -1) {
                        recipe.comments.splice(commentIndex, 1);
                        recipe.save();
                        res.redirect('/recipes/' + req.params.id);
                    }
                }
            });
        }
    });
});

// post '/comments' will submit the actual comment
// get '/comments/new' would be a form for the new comments
// put '/comments/:id; would be to edit the comment
// delete '/comments/:id' would delete that comment


module.exports = router;