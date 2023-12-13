const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
   const bookObject = JSON.parse(req.body.book);
   delete bookObject._id;
   delete bookObject.userId;
   const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? // si req.file existe, on traite la nouvelle image ; si non, on traite simplement l'objet entrant 
    {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (book.userId !== req.auth.userId) {
          return res.status(401).json({ error: 'Utilisateur non autorisé à modifier ce livre !' });
        } 
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié !'}))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => {
        if (book.userId !== req.auth.userId) {
          return res.status(401).json({ error: 'Utilisateur non autorisé à supprimer ce livre !' });
        }
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

exports.getBestRating = (req, res, next) => {
  // Récupère tous les livres de la base de données
  Book.find()
      .then((books) => {
          // Vérifie s'il n'y a aucun livre dans la base de données
          if (!books.length) {
              return res.status(404).json({ message: "Aucun livre dans la base de données." });
          }

          // Trie les livres par note moyenne et date d'ajout
          const sortedBooks = books.sort((a, b) => {
              if (b.averageRating !== a.averageRating) {
                  return b.averageRating - a.averageRating;
              }
              // Si deux livres ont la même note moyenne, on privilégie le livre ajouté le plus récemment
              return books.indexOf(b) - books.indexOf(a);
          });

          // Sélectionne les trois meilleurs livres
          const bestBooks = sortedBooks.slice(0, 3);

          return res.status(200).json(bestBooks);
      })
      .catch((err) => {
          res.status(err.status || 500).json({ error: err.message || "Une erreur inattendue s'est produite." });
      });
}


exports.rateBook = (req, res) => {
  // Vérifie si le corps de la requête est vide
  const isBodyEmpty = Object.keys(req.body).length === 0 ? true : false;

  if (isBodyEmpty) {
      return res.status(400).json({ message: "Le corps de la requête est vide." });
  }

  let newRating = { ...req.body };

  // Vérifie que la notation est dans la plage autorisée
  if (newRating.rating < 0 || newRating.rating > 5) {
      return res.status(400).json({ message: "La notation doit être entre 0 et 5." });
  }

  Book.findOne({ _id: req.params.id })
      .then((bookToRate) => {
          if (!bookToRate) {
              return res.status(404).json({ message: "Le livre n'existe pas." });
          }

          // Actualise le userId avec celui du token JWT pour s'assurer de l'identité de l'utilisateur
          newRating.userId = req.auth.userId;
          // Remplace la clé rating (envoyée par la requête) par la clé grade (attendue par le modèle Book)
          newRating.grade = newRating.rating;
          delete newRating.rating;

          // Vérifie si l'utilisateur a déjà déposé une note
          const hasUserAlreadyRated = bookToRate.ratings.some((item) => item.userId === newRating.userId);

          if (hasUserAlreadyRated) {
              return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
          }

          // Calcul de la nouvelle note moyenne
          bookToRate.ratings.push(newRating);
          const sum = bookToRate.ratings.reduce((total, item) => total + item.grade, 0);
          bookToRate.averageRating = sum / bookToRate.ratings.length;

          return bookToRate.save();
      })
      .then((updatedBook) => {
          return res.status(200).json(updatedBook);
      })
      .catch((err) => {
          if (err.message.includes("MONGODB_OBJECTID_ERROR")) {
              res.status(404).json({ message: "Le livre n'existe pas." });
          } else {
              res.status(err.status || 500).json({ error: err.message || "Une erreur inattendue s'est produite." });
          }
      });
}
