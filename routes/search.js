var express = require('express');

var app = express();

// Importando el modelo Hospital para la búsqueda de un hospital en el todo
var Hospital = require('../models/hospital');
// Importando el modelo Doctor para la búsqueda de un doctor en el todo
var Doctor = require('../models/doctor');

app.get('/all/:search', (req, res, next) => {
    // Extraer el parámetro de búsqueda
    var search = req.params.search;
    // Expresión regular para una búsqueda de coincidencias
    var regex = new RegExp(search, 'i')
        // Permite enviar un arreglo de promesas, ejecutarlas y si todas responden ok 
        // permite disparar un then y si no disparar un cath
    Promise.all([searchHospitals(search, regex),
            searchDoctors(search, regex)
        ])
        // recibir un arreglo con las respuestas
        .then(response => {
            // recibo la salida hospitals del resolve
            res.status(200).json({
                ok: true,
                message: 'Petición realizada correctamente',
                hospitals: response[0],
                doctors: response[1]
            });
        });
});
// Crear procesos asíncronos para realizar varias búsquedas al mismo tiempo
function searchHospitals(search, regex) {
    return new Promise((resolve, reject) => {
        // name: search => busca especificamente el texto ingresado
        Hospital.find({ name: regex }, (err, hospitals) => {
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
        Doctor.find({ name: regex }, (err, doctors) => {
            if (err) {
                reject('Error al cargar Doctores', err);
            } else {
                resolve(doctors)
            }
        });
    });
}

// Para usar fuera del archivo
module.exports = app;