var express = require('express');

var app = express();

// Rutas app: hace referencia al express, ejemplp-get: 'que tipo de procedimiento, servicio, petición se 
// quiere ejecutar, '/': path
app.get('/', (req, res, next) => {
    // Enviar las respuestas a las solicitudes .json(para que la respuesta sea de formato json)
    res.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });
});

// Para usar fuera del archivo
module.exports = app;