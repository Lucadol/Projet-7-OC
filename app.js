const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config()
console.log(process.env) // remove this after you've confirmed it is working

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // permet d'accéder à notre API depuis n'importe quelle origine ( '*' )
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // permet d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // permet d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
    next();
});

app.use(express.json());

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
