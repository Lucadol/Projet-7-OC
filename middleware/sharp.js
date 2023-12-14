const sharp = require('sharp');
const fs = require('fs');

module.exports = (req, res, next) => {
  if (!req.file) {
    console.log("Aucune image !");
    return next();
  }

  sharp(`images/${req.file.filename}`)
    .resize({ width: 450 })
    .webp({ quality: 80 })
    .toFile(`images/resize-${req.file.filename}`)
  
  next();

  sharp(req.file.path)
    .metadata()
    .then((metadata) => {
      if (metadata.width > 450) {
        return sharp(req.file.path).resize({ width: 450 }).toBuffer();
      } else {
        console.log('<=450');
        return sharp(req.file.path).toBuffer();
      }
    })
    .then((data) => {
      fs.writeFile(`images/resize-${req.file.filename}`, data, (err) => {
        if (err) {
          console.log("Middelware Sharp : error 1 :");
          console.log(err);
          next();
        } 
        next();
        
      });
    })
    .catch((err) => {
      console.log("Middelware Sharp : error :" + err);
      next(err);
    });
};
