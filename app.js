var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    methodOverride = require('method-override'),
    Recipe = require('./models/recipe');

var app = express();

mongoose.connect('mongodb://localhost/whatcha_cookin', { useNewUrlParser: true }); // creates/connects to a DB called whatcha_cookin'

app.set('view engine', 'ejs'); // Sets ejs as our file type for templates
app.use(express.static(__dirname + '/public')); // Lets express know to use the 'public' directory for assets
app.use(bodyParser.urlencoded({extended: true})); // Lets express get req.body 
app.use(methodOverride('_method')); // Allows us to make PUT and DELETE HTTP Requests by putting '_method=PUT' after a route 

/*
// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: 'Frank pooped the bed',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
*/

// Routes

// Landing Page
app.get('/', (req, res) => {
    res.render('landing');
});

// Index
app.get('/recipes', (req, res) => {
    Recipe.find({}, (err, Recipes) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', { recipe: Recipes });
        }
    });
});

// New
app.get('/recipes/new', (req, res) => {
    res.render('new');
});

// Create
app.post('/recipes', (req, res) => {
    var reqBody = req.body.recipe;
    var ingredientsFormatted = reqBody.ingredients.split('\r\n');
    var directionsFormatted = reqBody.directions.split('\r\n');
    var recipe = { title: reqBody.title,
        author: reqBody.author,
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
            console.log(`a new recipe was added to our DB, ${newRecipe}`);
        }
        
    });
    
    res.redirect('/recipes');
});


// Show
app.get('/recipes/:id', (req, res) => {
    Recipe.findById(req.params.id, (err, foundRecipe) => {
        if (err) {
            console.log(err);
        } else {
            res.render('show', {recipe: foundRecipe});
        }
    });
});

// Edit
app.get('/recipes/:id/edit', (req, res) => {
    Recipe.findById(req.params.id, (err, foundRecipe) => {
        if (err) {
            console.log(err);
        } else {
            res.render('edit', { recipe: foundRecipe });
        }
    });
});



app.listen(3000, () => {
    console.log('Server is running');
});



/* Routes */

// Landing page: get('/')
// Index: get('/recipes')
// New: get('/recipes/new')
// Create: post('/recipes')
// Show: get('/recipes/:id')
// Edit: get('/recipes/:id/edit')
// Update: put('/recipes/:id')
// Destroy: delete('/recipes/:id')


