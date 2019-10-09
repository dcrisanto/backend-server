var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
// default options
app.use(fileUpload());

app.put('/', (req, res) => {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono ningún archivo',
            erros: { message: 'Debe seleccionar una imagen' }
        })
    }

    // Obtener nombre del archivo
    const file = req.files.image;
    const cutFileName = file.name.split('.');
    const fileExtension = cutFileName[cutFileName.length - 1];

    // Extensiones permitidas
    const validExtension = ['png', 'jpg', 'jpeg', 'gif'];

    if (validExtension.indexOf(fileExtension) < 0) {
        res.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            erros: { message: 'Las extensiones válidas son ' + validExtension.join(', ') }
        })
    }

    res.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente',
        fileExtension
    });
});

module.exports = app;