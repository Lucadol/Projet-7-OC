const jwt = require('jsonwebtoken');

require('dotenv').config()

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // récupération du token dans le header Authorization de la requête entrante. Utilisation de la fonction split pour récupérer tout après l'espace dans le header Authorization
        const decodedToken = jwt.verify(token, process.env.TOKEN); // vérification du token avec la clé secrète (ici RANDOM_TOKEN_SECRET)
        const userId = decodedToken.userId; // extraction de l'ID utilisateur de notre token
        req.auth = {
            userId: userId
        };
    next(); // si tout est bon, on passe l'exécution de la fonction au middleware suivant
    } catch(error) {
        res.status(401).json({ error });
    }
};