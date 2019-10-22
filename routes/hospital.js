var express = require('express');

var app = express();

// Importar nuestro modelo de hospital
var Hospital = require('../models/hospital');

// Importar lo del Milddlerware
var mdAuthenticacion = require('../milddlerwares/autenticacion');

// ================================================================================
// Obtener todos los hospitales
// ================================================================================
// Rutas
app.get('/', (req, res, next) => {
    // Variable recibida del req para la Paginación
    var since = req.query.since || 0;
    since = Number(since);
    //find es gracias a mongo, donde defino el query que quiero usar para la búsqueda
    // {}: quiero que busque todo
    // () => {}: resultado de la búsqueda, viene como un callback
    Hospital.find({})
        .skip(since)
        .limit(9)
        // Llenar una propiedad del req utilizo la función populate
        // como 2 parámetro coloco los campos que quiero que muestre
        .populate('user', 'name email')
        .exec(
            (err, hospitals) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error de Base de datos',
                        errors: err
                    });
                }
                // Función para el conteo
                Hospital.count({}, (err, count) => {
                    // Si no ocurre ningún error
                    res.status(200).json({
                        ok: true,
                        message: 'Get de hospital!',
                        // Regreso el arreglo de todos los hospitales: hospitals: hospitals o simplemente hospitals
                        hospitals,
                        total: count
                    });
                })

            });

});

// ================================================================================
// Actualizar hospital
// ================================================================================
app.put('/:id', mdAuthenticacion.verificationToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'Error al encontrar hospital con el id ' + id,
                errors: err
            });
        }

        hospital.name = body.name;
        hospital.img = body.img;
        // Actualizar el usuario que lo está modificando
        hospital.user = req.user._id;

        // Grabar el hospital actualizado
        hospital.save((err, updateHospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar hospital con id ' + id,
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                updateHospital
            });
        });
    });
});

// ================================================================================
// Crear un nuevo hospital
// ================================================================================

app.post('/', mdAuthenticacion.verificationToken, (req, res) => {
    // Extrayendo información del body
    var body = req.body;
    // Creando un nuevo hospital
    var hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: req.user._id
    });

    // Grabación usando mongoose
    hospital.save((err, hospitalSave) => {
        // Si ocurre un error
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al crear hospital',
                errors: err
            });
        }

        // Si está todo ok, envío respuesta 201: Recurso creado
        res.status(201).json({
            ok: true,
            message: 'Hospital creado',
            hospital: hospitalSave, // hospital: nombre de la propiedad que retorno y hospitalSave: base de datos
            //userToken: req.user
        });

    });


});

// ================================================================================
// Delete hospital por id
// ================================================================================

app.delete('/:id', mdAuthenticacion.verificationToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al remover hospital',
                errors: err
            })
        }

        if (!hospitalDelete) {
            return res.status(400).json({
                ok: false,
                message: 'No existe hospital con el id' + id,
                errors: { menssage: 'No existe un hospital con el id' + id }
            })
        }

        res.status(200).json({
            ok: true,
            message: 'Hospital removido',
            hospitalDelete
        })
    });
});

// Usar fuera
module.exports = app;