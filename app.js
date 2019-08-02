// Requires: importación de librerías de terceros personalizadas que 
// se usan para que funcionne algo.
// Cargar la librería de express
var express = require('express');
// Hacer referencia a la librería de mongoose
var mongoose = require('mongoose')



// Inicializar variables, de esta manera defino el servidor express
var app = express();

// Establecer la conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, resp) => {
    if (err) throw err;

    // Si sucede un error esta línea jamás se va a ejecutar
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
})

// Rutas app: hace referencia al express, ejemplp-get: 'que tipo de procedimiento, servicio, petición se 
// quiere ejecutar, '/': path
app.get('/', (req, res, next) => {
    // Enviar las respuestas a las solicitudes .json(para que la respuesta sea de formato json)
    res.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones (puerto, mensaje)
app.listen(3000, () => {
    console.log('Express Server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});