var mongoose = require('mongoose');

var recipeSchema = new mongoose.Schema({
    title: String,
    author: String,
    image: String,
    time: String,
    ingredients: [String],
    description: String,
    directions: [String]
});

module.exports = mongoose.model('Recipe', recipeSchema);