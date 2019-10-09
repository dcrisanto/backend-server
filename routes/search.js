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
        // Llamo a la función searchHospitals recibiendo los parámetros
    searchHospitals(search, regex)
        // recibo la salida hospitals del resolve
        .then(hospitals => {
            res.status(200).json({
                ok: true,
                message: 'Petición realizada correctamente',
                hospitals
            });
        });
});
// Crear procesos asíncronos para realizar varias búsquedas al mismo tiempo
function searchHospitals(search, regex) {
    return new Promise((resolve, reject) => {
        // name: search => busca especificamente el texto ingresado
        Hospital.find({ name: regex }, (err, hospitals) => {
            if (err) {
                reject('Error a cargar hospitales', err);
            } else {
                resolve(hospitals);
            }
        });
    });
}

// Para usar fuera del archivo
module.exports = app;