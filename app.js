// Requires: importación de librerías de terceros personalizadas que 
// se usan para que funcionne algo.
// Cargar la librería de express
var express = require('express');
// Hacer referencia a la librería de mongoose
var mongoose = require('mongoose')

var bodyParser = require('body-parser');



// Inicializar variables, de esta manera defino el servidor express
var app = express();

// Milderware para habilitar los Cors
app.use(function(req, res, next) {
    // Origin de  datos para que se pueda realizar la petición desde cualquier lugar
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Body Parser, declarar Mildeware: siempre se ejecutan
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())


// Importar rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var doctorRoutes = require('./routes/doctor');
var searchRoutes = require('./routes/search');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/images');

// Establecer la conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, resp) => {
    if (err) throw err;

    // Si sucede un error esta línea jamás se va a ejecutar
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Server index config
const serveIndex = require('serve-index');
/*app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads'));*/

// Rutas: Definiendo para poder usarla
// Declarar Mildeware: se ejecuta antes de que se resuelvan otras rutas
// Cuando cualquier petición haga math con la pleca se usará appRooutes
app.use('/user', userRoutes); // Delante porque sino siempre pasaría por la ruta de abajo
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/doctor', doctorRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);
app.use('/', appRoutes);




// Escuchar peticiones (puerto, mensaje)
app.listen(3000, () => {
    console.log('Express Server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});