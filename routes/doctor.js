var express = require('express');

var app = express();

// Importar el modelo de doctor
var Doctor = require('../models/doctor');

// Importar lo del Milddlerware
var mdAuthenticacion = require('../milddlerwares/autenticacion');

// ================================================================================
// Obtener todos los doctores
// ================================================================================

app.get('/', (req, res, next) => {
    var since = req.query.since || 0;
    since = Number(since);
    Doctor.find({})
        .skip(since)
        .populate('user', 'name email')
        .populate('hospital')
        .exec(
            (err, doctors) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error de base de datos',
                        errors: err
                    });
                }
                Doctor.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        message: 'Get de doctor!',
                        doctors,
                        total: count
                    });
                })

            });
})

// ================================================================================
// Actualizar doctor
// ================================================================================
app.put('/:id', mdAuthenticacion.verificationToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Doctor.findById(id, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar doctor',
                errors: err
            });
        }

        if (!doctor) {
            return res.status(400).json({
                ok: false,
                message: 'Error al encontrar el doctor con el id ' + id,
                errors: err
            });
        }

        doctor.name = body.name;
        doctor.img = body.img;
        doctor.user = req.user._id;
        doctor.hospital = body.hospital

        // Grabar el doctor actualizado
        doctor.save((err, updateDoctor) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar doctor con id ' + id,
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                updateDoctor
            });
        });
    });
});

// ================================================================================
// Crear un nuevo doctor
// ================================================================================

app.post('/', mdAuthenticacion.verificationToken, (req, res) => {
    // Extrayendo información del body
    var body = req.body;
    // Creando un nuevo hospital
    var doctor = new Doctor({
        name: body.name,
        img: body.img,
        user: req.user._id, //req.user._id,
        hospital: body.hospital

    });

    // Grabación usando mongoose
    doctor.save((err, doctorSave) => {
        // Si ocurre un error
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al crear doctor',
                errors: err
            });
        }

        // Si está todo ok, envío respuesta 201: Recurso creado
        res.status(201).json({
            ok: true,
            message: 'Doctor creado',
            doctor: doctorSave, // doctor: nombre de la propiedad que retorno y doctorSave: base de datos
            //userToken: req.user
        });
    });
});

// ================================================================================
// Delete doctor por id
// ================================================================================

app.delete('/:id', mdAuthenticacion.verificationToken, (req, res) => {
    var id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, doctorDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al remover doctor',
                errors: err
            })
        }

        if (!doctorDelete) {
            return res.status(400).json({
                ok: false,
                message: 'No existe el doctor con el id' + id,
                errors: { menssage: 'No existe un doctor con el id' + id }
            })
        }

        res.status(200).json({
            ok: true,
            message: 'Doctor removido',
            doctorDelete
        })
    });
});

// Usar fuera
module.exports = app;