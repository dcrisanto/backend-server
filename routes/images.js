const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.get('/:type/:img', (req, res, next) => {
    const type = req.params.type;
    const img = req.params.img;
    // Me ayuda a resolver siempre este path para que quede correcto
    // __dirname: toda la ruta donde me encuentro en este momento
    // buscar la imagen: ../uploads/${type}/${img}
    const pathImage = path.resolve(__dirname, `../uploads/${type}/${img}`)

    // Si el path es válido
    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        const pathNoImage = path.resolve(__dirname, '../assets/user.png');
        res.sendFile(pathNoImage);
    }
});

module.exports = app;