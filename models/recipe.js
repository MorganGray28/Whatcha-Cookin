var mongoose = require('mongoose');

var recipeSchema = new mongoose.Schema({
    title: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    image: String,
    time: String,
    ingredients: [String],
    description: String,
    directions: [String]
});

module.exports = mongoose.model('Recipe', recipeSchema);