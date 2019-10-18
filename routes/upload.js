var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
// default options
app.use(fileUpload());
// :tipo Tipo de imagen al cual quiero subir (si es un usuario, médico o hospital)
// :id el Id del usuario que actualizaré
app.put('/:type/:id', (req, res) => {

    const type = req.params.type;
    const id = req.params.id;

    // Tipos de collection válidos
    const validTypes = ['hospitals', 'doctors', 'users'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de collection no es válida',
            erros: { message: 'Tipo de collection no es válida' }
        })
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono ningún archivo',
            erros: { message: 'Debe seleccionar una imagen' }
        });
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

    // Nombre de archivo personalizado
    const fileName = `${ id }-${ new Date().getMilliseconds()}.${fileExtension}`;

    // Mover el archivo temporal a un path
    const path = `./uploads/${ type }/${ fileName }`;

    file.mv(path, err => {

        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                error: err
            })
        }

        res.status(200).json({
            ok: true,
            message: 'Archivo movido',
            fileExtension
        });

    });


});

module.exports = app;