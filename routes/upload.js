var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
// Importar librería file system
const fs = require('fs');
// default options
app.use(fileUpload());
// Importando los modelos
const User = require('../models/user');
const Hospital = require('../models/hospital');
const Doctor = require('../models/doctor');

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
        });
    }

    // Si no envía imagen
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No seleccionó ningún archivo',
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
        });
    }

    // Nombre de archivo personalizado
    const fileName = `${ id }-${ new Date().getMilliseconds()}.${fileExtension}`;

    // Mover el archivo temporal a un path
    const path = `./uploads/${ type }/${ fileName }`;

    file.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                error: err
            });
        }

        uploadbytype(type, id, fileName, res);
    });
});

function uploadbytype(type, id, fileName, res) {
    if (type === 'users') {
        User.findById(id, (err, user) => {
            // No existe usuario
            if (!user) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe usuario con el id ' + id,
                    erros: { message: 'No existe usuario con el id ' + id, err }
                })
            }
            const oldPath = `./uploads/${ type }/${ user.img}`
                // Si existe, elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
            user.img = fileName;

            user.save((err, updatedUser) => {

                updatedUser.password = ':)';

                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    updatedUser
                });
            });
        });
    }

    if (type === 'doctors') {
        Doctor.findById(id, (err, doctor) => {
            // No existe doctor
            if (!doctor) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe doctor con el id ' + id,
                    erros: { message: 'No existe doctor con el id ' + id, err }
                });
            }

            const oldPath = `./uploads/${ type }/${ doctor.img}`
                // Si existe, elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            doctor.img = fileName;

            doctor.save((err, updatedDoctor) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de doctor actualizada',
                    updatedDoctor
                });
            });

        });

    }

    if (type === 'hospitals') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al buscar hospital',
                    erros: { message: 'Error al buscar hospital', err }
                })
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe hospital con el id ' + id,
                    erros: { message: 'No existe hospital con el id ' + id, err }
                });
            }
            const oldPath = `./uploads/${ type }/${ hospital.img }`
                // Si existe, elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            hospital.img = fileName;

            hospital.save((err, updatedHospital) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    updatedHospital
                });
            });
        });
    }
}

module.exports = app;