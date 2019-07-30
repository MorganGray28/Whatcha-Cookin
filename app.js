var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    methodOverride = require('method-override'),
    Recipe = require('./models/recipe'),
    User = require('./models/user'),
    recipeRoutes = require('./routes/recipe'),
    indexRoutes = require('./routes/index');
    commentRoutes = require('./routes/comments');

var app = express();

mongoose.connect('mongodb://localhost/whatcha_cookin', { useNewUrlParser: true }); // creates/connects to a DB called whatcha_cookin'

app.set('view engine', 'ejs'); // Sets ejs as our file type for templates
app.use(express.static(__dirname + '/public')); // Lets express know to use the 'public' directory for assets
app.use(bodyParser.urlencoded({extended: true})); // Lets express get req.body 
app.use(methodOverride('_method')); // Allows us to make PUT and DELETE HTTP Requests by putting '_method=PUT' after a route 


// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: 'Charlie: King of The Rats',
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

// Routes
app.use(recipeRoutes);
app.use(indexRoutes);
app.use(commentRoutes);

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