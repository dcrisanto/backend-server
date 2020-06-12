var express = require('express');

var app = express();

// Importando el modelo Hospital para la búsqueda de un hospital en el todo
var Hospital = require('../models/hospital');
// Importando el modelo Doctor para la búsqueda de un doctor en el todo
var Doctor = require('../models/doctor');
// Importando el modelo User para la bpusqueda de usuarios
var User = require('../models/user');

// ================================================================================
// Búsqueda por colección
// ================================================================================
app.get('/collection/:table/:search', (req, res) => {
    var table = req.params.table;
    var search = req.params.search;
    var regex = new RegExp(search, 'i');
    var promise;
    switch (table) {

        case 'hospitals':
            promise = searchHospitals(search, regex);
            break;

        case 'doctors':
            promise = searchDoctors(search, regex);
            break;

        case 'users':
            promise = searchUsers(search, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'Los tipos de búsqueda sólo son: users, hospitals y doctors',
                err: { message: 'Tipo de tabla/collection no válido' }
            })
    }


    promise.then(data => {
        res.status(200).json({
            ok: true,
            message: 'Petición realizada correctamente',
            // []: Colocar entre llaves para obtener el valor de table dinamicamente
            [table]: data
        });
    });
});
// ================================================================================
// Búsqueda general
// ================================================================================
app.get('/all/:search', (req, res, next) => {
    // Extraer el parámetro de búsqueda
    var search = req.params.search;
    // Expresión regular para una búsqueda de coincidencias
    var regex = new RegExp(search, 'i')
        // Permite enviar un arreglo de promesas, ejecutarlas y si todas responden ok 
        // permite disparar un then y si no disparar un cath
    Promise.all([searchHospitals(search, regex),
            searchDoctors(search, regex),
            searchUsers(search, regex)
        ])
        // recibir un arreglo con las respuestas
        .then(response => {
            // recibo la salida hospitals del resolve
            res.status(200).json({
                ok: true,
                message: 'Petición realizada correctamente',
                hospitals: response[0],
                doctors: response[1],
                users: response[2]
            });
        });
});
// Crear procesos asíncronos para realizar varias búsquedas al mismo tiempo
function searchHospitals(search, regex) {
    return new Promise((resolve, reject) => {
        // name: search => busca especificamente el texto ingresado
        Hospital.find({ name: regex })
            .populate('user', 'name email')
            .exec((err, hospitals) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitals);
                }
            });
    });
}

function searchDoctors(search, regex) {
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regex })
            .populate('user', 'name email')
            .populate('hospital')
            .exec((err, doctors) => {
                if (err) {
                    reject('Error al cargar Doctores', err);
                } else {
                    resolve(doctors)
                }
            });
    });
}

function searchUsers(search, regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name email rol google')
            .or([{ 'name': regex }, { 'email': regex }])
            .exec((err, users) => {
                if (err) {
                    reject('Error al cargar usuario', err);
                } else {
                    resolve(users)
                }
            });
    });
}

// Para usar fuera del archivo
module.exports = app;