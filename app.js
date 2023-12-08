const mongoose = require('mongoose');
const express = require('express');

const Book = require('./models/book');

mongoose.connect('mongodb+srv://lucas7OC:Di59WiuyRLpTVRCi@cluster0.7npw4em.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // permet d'accéder à notre API depuis n'importe quelle origine ( '*' )
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // permet d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // permet d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
  next();
});

app.post('/api/books', (req, res, next) => {
    delete req.body._id;
    const book = new Book({
      ...req.body
    });
    book.save()
      .then(book => res.status(201).json({ book}))
      .catch(error => res.status(400).json({ error }));
});

app.put('/api/books/:id', (req, res, next) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Modified!'}))
      .catch(error => res.status(400).json({ error }));
});

app.delete('/api/books/:id', (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Deleted!'}))
      .catch(error => res.status(400).json({ error }));
});

app.get('/api/books/:id', (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json({book}))
    .catch(error => res.status(404).json({ error }));
});

app.use('/api/books', (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json({ books }))
      .catch(error => res.status(400).json({ error }));
});

module.exports = app;
