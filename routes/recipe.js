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
        return cb(new Error('Only image files are allowed!'), false);
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
router.post('/recipes', middleware.isLoggedIn, upload.single('image'), (req, res) => {
    var reqBody = req.body.recipe;
    var ingredientsFormatted = removeEmptyElements(reqBody.ingredients.split('\r\n'));
    var directionsFormatted = removeEmptyElements(reqBody.directions.split('\r\n'));
    // image upload
    cloudinary.uploader.upload(req.file.path, function(error, result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.recipe.image = result.secure_url;
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
            } else {
                req.user.userRecipes.push(newRecipe);
                req.user.save();
            }
        });
        
        res.redirect('/recipes');
    });
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
            res.redirect('back');
            req.user.userRecipes.pull(req.params.id);
            req.user.save();
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