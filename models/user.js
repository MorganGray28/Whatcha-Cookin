var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    // We store an array of referenced recipe ObjectIds
    // when we click a button, it makes a post route
    // we check to see if currentUser has the recipe's id already stored in req.user.favorites using the .some() method
        // if it's stored, we remove it
        // if it's not stored, we add it into the favorites array and save user
    // When we display the user profile or try to view favorites, we'll populate the favorites array
    // When we view an index of all recipes, we'll have an if statement (if the recipe.id is in the favorites array, display the active class on the button)
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);