var express = require('express');
var router = express.Router();
var Recipe = require('../models/recipe');
var middleware = require('../middleware/index');

// Image Upload Configuration
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('File must be in image format'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary').v2;
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Index
router.get('/recipes', (req, res) => {
    if(req.query.search) {
        const query = req.query.search;
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Recipe.find({title: regex}, (err, recipe) => {
            if(err) {
                req.flash('error', err.message);
                res.redirect('/recipes');
            } else {
                res.render('recipes/index', { recipe: recipe, query: query });
            }
        }); 
    } else {
        Recipe.find({}, (err, Recipes) => {
            if (err) {
                req.flash('error', 'There was an error loading the recipes');
                res.redirect('/recipes');
            } else {
                res.render('recipes/index', { recipe: Recipes, query: null });
            }
        });
    }  
});

// New
router.get('/recipes/new', middleware.isLoggedIn, (req, res) => {
    res.render('recipes/new');
});

// Create
router.post('/recipes', middleware.isLoggedIn, upload.single('image'), (req, res) => {
    var reqBody = req.body.recipe;
    var ingredientsFormatted = removeEmptyElements(reqBody.ingredients.split('\r\n'));
    var directionsFormatted = removeEmptyElements(reqBody.directions.split('\r\n'));
    // image upload
    cloudinary.uploader.upload(req.file.path, {width: 1400, height: 1400, crop: "limit"}, function(error, result) {
        if(error) {
            req.flash('error', 'There was an error uploading your image');
            res.redirect('back');
        } else {
            // add cloudinary url for the image to the campground object under image property
            req.body.recipe.image = result.secure_url;
            req.body.recipe.imageId = result.public_id;
            var recipe = { title: reqBody.title,
                author: {
                    id: req.user._id,
                    username: req.user.username
                },
                image: reqBody.image,
                imageId: reqBody.imageId,
                time: reqBody.time,
                ingredients: ingredientsFormatted,
                description: reqBody.description,
                directions: directionsFormatted
            }

            Recipe.create(recipe, (err, newRecipe) => {
                if(err) {
                    req.flash('error', err);
                    res.redirect('/recipes');
                } else {
                    req.user.userRecipes.push(newRecipe);
                    req.user.save();
                }
            });
            
            res.redirect('/recipes');
        }     
    });
});



// Show
router.get('/recipes/:id', (req, res) => {
    Recipe.findById(req.params.id).populate('comments').exec((err, foundRecipe) => {
        if (err || !foundRecipe) {
            req.flash('error', 'Recipe Not Found');
            res.redirect('/recipes');
        } else {
            res.render('recipes/show', {recipe: foundRecipe});
        }
    });
});

// Edit
router.get('/recipes/:id/edit', middleware.isRecipeOwner, (req, res) => {
    Recipe.findById(req.params.id, (err, foundRecipe) => {
        if (err || !foundRecipe) {
            req.flash('error', 'Recipe Not Found');
            res.redirect('/recipes');
        } else {
            res.render('recipes/edit', { recipe: foundRecipe });
        }
    });
});

// Update
router.put('/recipes/:id', middleware.isRecipeOwner, upload.single('image'), (req, res) => {
    var reqBody = req.body.recipe;
    // Each ingredient/direction is entered on a new line, so we can separate each ingredient into an array values by splitting based on \r\n
    var ingredientsFormatted = removeEmptyElements(reqBody.ingredients.split('\r\n'));
    var directionsFormatted = removeEmptyElements(reqBody.directions.split('\r\n'));

    // find the Recipe that we're updating, use async so we can set the new image and image ID without the other code below running first
    Recipe.findById(req.params.id, async (err, foundRecipe) => {
        if(err) {
            req.flash('error', 'There was an error updating the Recipe');
            res.redirect('/recipes');
        } else {
            // if a new file is uploaded to the edit, we'll destroy the old one and upload the new one
            if(req.file) {
                try {
                    // destroy the old image by imageId
                    await cloudinary.uploader.destroy(foundRecipe.imageId);
                    // add the new image url and imageId through the upload result
                    var result = await cloudinary.uploader.upload(req.file.path, {width: 1400, height: 1400, crop: "limit"});
                    foundRecipe.image = result.secure_url;
                    foundRecipe.imageId = result.public_id;
                } catch (err) {
                    req.flash('error', 'There was an error deleting the recipe image');
                    res.redirect('/recipes');
                }
            }
            foundRecipe.title = reqBody.title;
            foundRecipe.time = reqBody.time;
            foundRecipe.ingredients = ingredientsFormatted;
            foundRecipe.directions = directionsFormatted;
            foundRecipe.save();
            res.redirect('/recipes/' + req.params.id);
        }
    });  
});

// Delete Route
router.delete('/recipes/:id', middleware.isRecipeOwner, (req, res) => {
    Recipe.findByIdAndDelete(req.params.id, (err, recipe) => {
        if (err) {
            req.flash('error', 'There was an error deleting the recipe');
            res.redirect('/recipes');
        } else {
            res.redirect('back');
            req.user.userRecipes.pull(req.params.id);
            req.user.save();
            cloudinary.uploader.destroy(recipe.imageId, (err, result) => {
                if(err) {
                    req.flash('error', 'There was an error deleting the recipe image');
                    res.redirect('/recipes');
                }
            });
        }
    });
});


// Functions:
// Search Form Regex function to find Recipes
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// Remove empty directions or ingredients that are created by user's leaving a blank line
var removeEmptyElements = (arr) => {
    var filteredArr = arr.filter((el) => {
        return el != '';
    });
    return filteredArr;
}

module.exports = router;