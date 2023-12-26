const sharp = require('sharp');
const fs = require('fs');

module.exports = (req, res, next) => {
  if (!req.file) {
    console.log("Aucune image !");
    return next();
  }

  let filename = req.file.filename;
  filename = filename.replace(/\.(jpg|jpeg|png|JPEG)$/, '');

  console.log(filename)

  sharp(`images/${req.file.filename}`)
    .resize({ width: 450 })
    .webp({ lostless: true })
    .toFile(`images/resize-${filename}.webp`, (err) => {
      if (err) {
        console.log("Middleware Sharp : erreur 1 :", err);
        return next(err);
      }
      console.log('Image redimensionnée avec succès !');
      next();
    });
};
