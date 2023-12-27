const bcrypt = require('bcrypt'); // importe le package de chiffrement bcrypt
const jwt = require('jsonwebtoken'); // importe le package jsonwebtoken

require('dotenv').config(); // importe le package dotenv pour masquer les informations de connexion à la base de données

const User = require('../models/user'); // importe le modèle User

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // hash le mot de passe 10 fois
        .then(hash => {
            const user = new User({ // crée un nouvel utilisateur
                email: req.body.email,
                password: hash
            });
            user.save() // enregistre l'utilisateur dans la base de données
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) // renvoie une réponse de réussite en cas de succès
                .catch(error => res.status(400).json({ error })); // renvoie une erreur en cas d'échec
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // recherche l'utilisateur dans la base de données
        .then(user => {
            if (!user) { // si l'utilisateur n'est pas trouvé
                return res.status(401).json({ error: 'Paire identifiant/mot de passe incorrecte' });
            }
            bcrypt.compare(req.body.password, user.password) // compare le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
                .then(valid => {
                    if (!valid) { // si la comparaison n'est pas valide
                        return res.status(401).json({ error: 'Paire identifiant/mot de passe incorrecte' });
                    }
                    res.status(200).json({ // si la comparaison est valide
                        userId: user._id,
                        token: jwt.sign( // renvoie un token d'authentification
                            { userId: user._id },
                            process.env.TOKEN, // chaîne secrète de développement temporaire pour encoder notre token
                            { expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};