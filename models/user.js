const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator'); // permet de s'assurer que deux utilisateurs ne peuvent pas utiliser la même adresse e-mail pour créer un compte utilisateur

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, // unique: true empêche deux utilisateurs de s'inscrire avec la même adresse e-mail
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
