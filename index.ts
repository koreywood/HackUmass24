const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
console.log(process.env);
// Connect to MongoDB
mongoose.connect(process.env.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
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
const Item = mongoose.model('Item', ItemSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});