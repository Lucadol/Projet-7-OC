const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://lucas7OC:Di59WiuyRLpTVRCi@cluster0.7npw4em.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // permet d'accéder à notre API depuis n'importe quelle origine ( '*' )
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // permet d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // permet d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
  next();
});

app.use(bodyParser.json());

app.use('/api/book', bookRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
