const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
const ingredients = [];

// Connect to MongoDB
mongoose.connect(process.env.URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// Define a simple schema and model
const Schema = mongoose.Schema;
const ItemSchema = new Schema({
    name: String,
    id: Number,
    quantity: Number
});
const items = mongoose.model('items', ItemSchema);

// API routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/getItem', async (req, res) => {
    const id = Number.parseInt(req.query.id);
    items.findOne({ id: id }).then((item) => {
        ingredients.push(item.name);
        res.redirect('/recipes');
    }).catch((err) => {
        console.error('Failed to get item', err);
        res.redirect('/recipes');
    });
});

app.get('/addItems', async (req, res) => {
    await fetch(`https://api.spoonacular.com/food/ingredients/search?apiKey=${process.env.API_KEY}&query=z&number=20`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            data.results.forEach((item) => {
                const newItem = new items({ id: item.id, name: item.name, quantity: 1 });
                newItem.save().then(() => {
                    console.log(newItem);
                }).catch((err) => {
                    console.error('Failed to add item', err);
                });
            });
        }).catch((err) => {
            console.error('Failed to fetch items', err);
        });
    res.redirect('/recipes');
});

app.get('/recipes', async (req, res) => {
    if (ingredients.length === 0) {
        res.send('No ingredients added');
        return;
    }
    console.log(ingredients.reduce((acc, curr) => acc + ',' + curr));
    const recipes = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.API_KEY}&ingredients=${ingredients.reduce((acc, curr) => acc + ',' + curr)}`)
        .then((response) => response.json())
        .then((data) => data)
        .catch((err) => {
            console.error('Failed to fetch recipes', err);
        });
    console.log(recipes);
    res.render('recipes', { recipes: recipes });

});
app.get('/recipe/:id', async (req, res) => {
    const id = req.params.id;
    const recipe = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.API_KEY}`)
        .then((response) => response.json())
        .then((data) => data)
        .catch((err) => {
            console.error('Failed to fetch recipe', err);
        });
    res.render('recipe', { recipe: recipe });
});
app.get('*', (req, res) => {
    res.send('404 Page Not Found');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});