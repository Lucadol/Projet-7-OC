const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup); // enregistre un nouvel utilisateur
router.post('/login', userCtrl.login); // connecte un utilisateur existant

module.exports = router;
