var express = require('express');
var router = express.Router();
var Recipe = require('../models/recipe');
var middleware = require('../middleware/index');

// Index
router.get('/recipes', (req, res) => {
    Recipe.find({}, (err, Recipes) => {
        if (err) {
            console.log(err);
        } else {
            res.render('recipes/index', { recipe: Recipes });
        }
    });
});

// New
router.get('/recipes/new', middleware.isLoggedIn, (req, res) => {
    res.render('recipes/new');
});

// Create
router.post('/recipes', middleware.isLoggedIn, (req, res) => {
    var reqBody = req.body.recipe;
    var ingredientsFormatted = removeEmptyElements(reqBody.ingredients.split('\r\n'));
    var directionsFormatted = removeEmptyElements(reqBody.directions.split('\r\n'));
    var recipe = { title: reqBody.title,
        author: {
            id: req.user._id,
            username: req.user.username
        },
        image: reqBody.image,
        time: reqBody.time,
        ingredients: ingredientsFormatted,
        description: reqBody.description,
        directions: directionsFormatted
    }

    Recipe.create(recipe, (err, newRecipe) => {
        if(err) {
            console.log(err);
        } 
    });
    
    res.redirect('/recipes');
});


// Show
router.get('/recipes/:id', (req, res) => {
    Recipe.findById(req.params.id).populate('comments').exec((err, foundRecipe) => {
        if (err) {
            console.log(err);
        } else {
            res.render('recipes/show', {recipe: foundRecipe});
        }
    });
});

// Edit
router.get('/recipes/:id/edit', middleware.isRecipeOwner, (req, res) => {
    Recipe.findById(req.params.id, (err, foundRecipe) => {
        if (err) {
            console.log(err);
        } else {
            res.render('recipes/edit', { recipe: foundRecipe });
        }
    });
});

// Update
router.put('/recipes/:id', middleware.isRecipeOwner, (req, res) => {
    var reqBody = req.body.recipe;
    var ingredientsFormatted = removeEmptyElements(reqBody.ingredients.split('\r\n'));
    var directionsFormatted = removeEmptyElements(reqBody.directions.split('\r\n'));
    var recipe = { title: reqBody.title,
        author: {
            id: req.user._id,
            username: req.user.username
        },
        image: reqBody.image,
        time: reqBody.time,
        ingredients: ingredientsFormatted,
        description: reqBody.description,
        directions: directionsFormatted
    }
    Recipe.findByIdAndUpdate(req.params.id, recipe, (err, updatedRecipe) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect(`/recipes/${req.params.id}`);
        }
    });
});

router.delete('/recipes/:id', middleware.isRecipeOwner, (req, res) => {
    Recipe.findByIdAndDelete(req.params.id, (err, recipe) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/recipes');
        }
    });
});

var removeEmptyElements = (arr) => {
    var filteredArr = arr.filter((el) => {
        return el != '';
    });
    return filteredArr;
}

module.exports = router;